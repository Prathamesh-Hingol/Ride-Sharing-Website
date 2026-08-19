import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

export class RideLifecycleError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "RideLifecycleError";
  }
}

export interface NewRideData {
  /** User's internal DB id — taken from session, never from request body */
  userID: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  vehicleType: string;
  seatsAvailable: number;
  totalCost: number;
}

export async function getRideGroup({ rideID, userID }: { rideID: number; userID: number }) {
  const ride = await prisma.rides.findUnique({
    where: { rideID },
    include: {
      creator: { select: { id: true, name: true, email: true, picture: true } },
      requests: {
        where: { requestStatus: "Accepted" },
        include: { requester: { select: { id: true, name: true, email: true, picture: true } } },
      },
    },
  });
  if (!ride) throw new RideLifecycleError("Ride not found", 404);

  const isAcceptedMember = ride.requests.some((r) => r.requestBy === userID);
  if (ride.createdBy !== userID && !isAcceptedMember) {
    throw new RideLifecycleError("Only ride members can view this group", 403);
  }

  return {
    rideID: ride.rideID,
    source: ride.source,
    destination: ride.destination,
    date: ride.date,
    time: ride.time,
    vehicleType: ride.vehicleType,
    totalSeats: ride.totalSeats,
    seatsAvailable: ride.seatsAvailable,
    rideStatus: ride.rideStatus,
    members: [ride.creator, ...ride.requests.map((r) => r.requester)],
  };
}

export async function cancelRide({ rideID, ownerID }: { rideID: number; ownerID: number }) {
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({ where: { rideID } });
    if (!ride) throw new RideLifecycleError("Ride not found", 404);
    if (ride.createdBy !== ownerID) throw new RideLifecycleError("Only the ride owner can cancel this ride", 403);
    if (ride.rideStatus !== "Pending") throw new RideLifecycleError("Only pending rides can be cancelled");

    const updated = await tx.rides.updateMany({
      where: { rideID, rideStatus: "Pending" },
      data: { rideStatus: "Cancelled" },
    });
    if (updated.count !== 1) throw new RideLifecycleError("Ride could not be cancelled");

    await tx.requests.updateMany({
      where: { rideID, requestStatus: "Pending" },
      data: { requestStatus: "Rejected" },
    });
    return { rideID, rideStatus: "Cancelled" };
  });
}

export async function leaveRide({ rideID, userID }: { rideID: number; userID: number }) {
  return prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true },
    });
    if (!ride) throw new RideLifecycleError("Ride not found", 404);
    if (ride.createdBy === userID) throw new RideLifecycleError("The ride owner must cancel the ride instead");
    if (ride.rideStatus !== "Pending") throw new RideLifecycleError("Only pending rides can be left");

    const request = await tx.requests.findFirst({
      where: { rideID, requestBy: userID, requestStatus: "Accepted" },
    });
    if (!request) throw new RideLifecycleError("You are not an accepted member of this ride", 404);

    await tx.requests.update({ where: { id: request.id }, data: { requestStatus: "Left" } });
    await tx.rides.update({ where: { rideID }, data: { seatsAvailable: { increment: 1 } } });
    return { rideID, requestStatus: "Left" };
  });
}

/**
 * Mark past rides as Completed, then return all future Pending rides
 * with their creator's user info.
 *
 * The complex date+time comparison must stay as $queryRaw because
 * Prisma doesn't natively support casting a string column to timestamp.
 */
export async function getPendingRides() {
  try {
    // Mark expired rides as Completed
    await prisma.$executeRaw`
      UPDATE rides
      SET "rideStatus" = 'Completed'
      WHERE ("date"::timestamp + "time"::interval) <= NOW()
      AND "rideStatus" != 'Completed'
    `;

    // Fetch all future pending rides with creator details
    const rows = await prisma.$queryRaw`
      SELECT r.*, u.name, u.email, u.picture
      FROM rides r
      INNER JOIN users u ON u.id = r."createdBy"
      WHERE r."rideStatus" = 'Pending'
        AND r."seatsAvailable" > 0
        AND ("date"::timestamp + "time"::interval) > NOW()
    `;

    logger.info("Fetched pending rides successfully");
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching pending rides: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Get filtered pending rides by source, destination, date, time.
 */
export async function getFilteredPendingRides({
  source,
  destination,
  date,
  time,
}: {
  source: string;
  destination: string;
  date: string;
  time: string;
}) {
  try {
    const where: Prisma.ridesWhereInput = {
      rideStatus: "Pending",
      seatsAvailable: { gt: 0 },
    };

    if (date) where.date = date;
    if (time) where.time = time;
    if (source?.trim()) where.source = { contains: source.trim(), mode: "insensitive" };
    if (destination?.trim()) where.destination = { contains: destination.trim(), mode: "insensitive" };

    const rides = await prisma.rides.findMany({ where, include: { creator: true } });
    logger.info("Filtered pending rides fetched successfully");
    return rides;
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching filtered pending rides: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Add a newly created ride.
 * Uses userID directly from session — no redundant email lookup.
 */
export async function addNewlyCreatedRide(data: NewRideData): Promise<void> {
  try {
    await prisma.rides.create({
      data: {
        createdBy: data.userID,
        source: data.source,
        destination: data.destination,
        date: data.date,
        time: data.time,
        seatsAvailable: data.seatsAvailable,
        totalSeats: data.seatsAvailable,
        totalCost: data.totalCost,
        vehicleType: data.vehicleType,
        rideStatus: "Pending",
      },
    });
    logger.info("Newly created ride added successfully");
  } catch (error) {
    const err = error as Error;
    logger.error(`Error adding newly created ride: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Get upcoming (Pending) rides that the user created or joined.
 */
export async function getUpcomingRides({ userID }: { userID: number }) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        r."rideID", r."createdBy", r.source, r.destination,
        r.date, r.time, r."seatsAvailable", r."totalCost",
        r."vehicleType", u1.name AS "creatorName", r."rideStatus",
        STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
      FROM rides r
      INNER JOIN users u1 ON r."createdBy" = u1.id
      LEFT JOIN requests req
        ON req."rideID" = r."rideID" AND req."requestStatus" = 'Accepted'
      LEFT JOIN users u2 ON req."requestBy" = u2.id
      WHERE r."rideStatus" = 'Pending'
        AND (
          r."createdBy" = ${userID}
          OR EXISTS (
            SELECT 1 FROM requests req2
            WHERE req2."rideID" = r."rideID"
              AND req2."requestBy" = ${userID}
              AND req2."requestStatus" = 'Accepted'
          )
        )
      GROUP BY
        r."rideID", r."createdBy", r.source, r.destination, r.date, r.time,
        r."seatsAvailable", r."totalCost", r."vehicleType", r."rideStatus", u1.name
    `;
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching upcoming rides: ${err.message}`);
    throw new Error(err.message);
  }
}

/**
 * Get completed rides that the user created or joined.
 */
export async function getCompletedRides({ userID }: { userID: number }) {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        r."rideID", r."createdBy", r.source, r.destination,
        r.date, r.time, r."seatsAvailable", r."totalCost",
        r."vehicleType", u1.name AS "creatorName", r."rideStatus",
        STRING_AGG(u2.name, ', ') AS "ridePartnerNames"
      FROM rides r
      INNER JOIN users u1 ON r."createdBy" = u1.id
      LEFT JOIN requests req
        ON req."rideID" = r."rideID" AND req."requestStatus" = 'Accepted'
      LEFT JOIN users u2 ON req."requestBy" = u2.id
      WHERE r."rideStatus" = 'Completed'
        AND (
          r."createdBy" = ${userID}
          OR EXISTS (
            SELECT 1 FROM requests req2
            WHERE req2."rideID" = r."rideID"
              AND req2."requestBy" = ${userID}
              AND req2."requestStatus" = 'Accepted'
          )
        )
      GROUP BY
        r."rideID", r."createdBy", r.source, r.destination, r.date, r.time,
        r."seatsAvailable", r."totalCost", r."vehicleType", r."rideStatus", u1.name
    `;
    return rows;
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching completed rides: ${err.message}`);
    throw new Error(err.message);
  }
}

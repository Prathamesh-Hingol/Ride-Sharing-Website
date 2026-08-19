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
  totalCost?: number | null;
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
    totalCost: ride.totalCost ?? null,
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

    // Single update — Prisma throws P2025 if not found, so no count check needed.
    await tx.rides.update({
      where: { rideID },
      data: { rideStatus: "Cancelled" },
    });

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
 * Mark past rides as Completed (lazy expiry on each fetch), then return all
 * future Pending rides with their creator's profile info.
 *
 * The $executeRaw is required because Prisma cannot cast a VARCHAR date+time
 * column pair to a timestamp in a single expression.
 *
 * Time format defence: the `time` column may contain 'HH:MM', 'HH:MM:SS', or
 * legacy values like 'HH:MM:SS:xx'. We always extract only the HH and MM parts
 * via SPLIT_PART before building the interval, so malformed values never crash
 * the query (fixes: "invalid input syntax for type interval: '21:56:00:00'").
 */
export async function getPendingRides() {
  try {
    // Mark expired rides as Completed.
    // SPLIT_PART extracts HH and MM regardless of how many colon-delimited
    // segments are stored, then ':00' makes it a valid HH:MM:SS interval.
    await prisma.$executeRaw`
      UPDATE rides
      SET "rideStatus" = 'Completed'
      WHERE (
        "date"::date
        + (SPLIT_PART("time", ':', 1) || ':' || SPLIT_PART("time", ':', 2) || ':00')::interval
      ) <= NOW()
        AND "rideStatus" NOT IN ('Completed', 'Cancelled')
    `;

    // Fetch all still-pending rides using typed Prisma query.
    const rides = await prisma.rides.findMany({
      where: {
        rideStatus: "Pending",
        seatsAvailable: { gt: 0 },
      },
      include: {
        creator: { select: { id: true, name: true, email: true, picture: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    logger.info("Fetched pending rides successfully");
    return rides;
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

    const rides = await prisma.rides.findMany({
      where,
      include: { creator: { select: { id: true, name: true, email: true, picture: true } } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
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
        totalCost: data.totalCost ?? null,
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
 * Shared helper: get rides (upcoming or completed) that the user created or joined.
 * Replaces two nearly identical raw SQL blocks with a single typed Prisma query.
 */
async function getUserRidesByStatus(userID: number, rideStatus: string) {
  return prisma.rides.findMany({
    where: {
      rideStatus,
      OR: [
        { createdBy: userID },
        {
          requests: {
            some: { requestBy: userID, requestStatus: "Accepted" },
          },
        },
      ],
    },
    include: {
      creator: { select: { id: true, name: true } },
      requests: {
        where: { requestStatus: "Accepted" },
        include: { requester: { select: { id: true, name: true } } },
      },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
}

/**
 * Get upcoming (Pending) rides that the user created or joined.
 */
export async function getUpcomingRides({ userID }: { userID: number }) {
  try {
    const rides = await getUserRidesByStatus(userID, "Pending");
    logger.info("Fetched upcoming rides successfully");
    return rides.map((ride) => ({
      rideID: ride.rideID,
      createdBy: ride.createdBy,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      seatsAvailable: ride.seatsAvailable,
      totalCost: ride.totalCost,
      vehicleType: ride.vehicleType,
      rideStatus: ride.rideStatus,
      creatorName: ride.creator.name,
      ridePartnerNames: ride.requests.map((r) => r.requester.name).filter(Boolean).join(", "),
    }));
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
    const rides = await getUserRidesByStatus(userID, "Completed");
    logger.info("Fetched completed rides successfully");
    return rides.map((ride) => ({
      rideID: ride.rideID,
      createdBy: ride.createdBy,
      source: ride.source,
      destination: ride.destination,
      date: ride.date,
      time: ride.time,
      seatsAvailable: ride.seatsAvailable,
      totalCost: ride.totalCost,
      vehicleType: ride.vehicleType,
      rideStatus: ride.rideStatus,
      creatorName: ride.creator.name,
      ridePartnerNames: ride.requests.map((r) => r.requester.name).filter(Boolean).join(", "),
    }));
  } catch (error) {
    const err = error as Error;
    logger.error(`Error fetching completed rides: ${err.message}`);
    throw new Error(err.message);
  }
}

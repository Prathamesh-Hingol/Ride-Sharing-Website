import { prisma } from "../config/prisma.js";

export class RequestError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "RequestError";
  }
}

export interface SentRequestParams {
  rideID: number;
  requestBy: number;
}

export interface ReceivedRequestParams {
  rideID: number;
  requestBy: number;
  flag: "Accepted" | "Rejected";
  ownerID: number;
}

/**
 * Send a ride request.
 * - If an Accepted/Pending request already exists, return its status.
 * - If previously Rejected, delete the old row and create a fresh Pending one.
 * Returns a status string describing the outcome.
 */
export async function handleUserSentRequest({ rideID, requestBy }: SentRequestParams): Promise<string> {
  // Check for an existing request for this ride by this user
  const existing = await prisma.requests.findFirst({ where: { rideID, requestBy } });

  if (existing) {
    if (existing.requestStatus === "Accepted") return "Accepted";
    if (existing.requestStatus === "Pending") return "Pending";
    // Rejected — allow re-request by deleting the old row first
    await prisma.requests.delete({ where: { id: existing.id } });
  }

  // Look up the ride to get createdBy and rideStatus
  const ride = await prisma.rides.findUnique({
    where: { rideID },
    select: { createdBy: true, rideStatus: true },
  });

  if (!ride) throw new RequestError(`Ride ${rideID} not found`, 404);
  if (ride.createdBy === requestBy) throw new RequestError("You cannot join your own ride");
  if (ride.rideStatus !== "Pending") throw new RequestError("This ride is no longer accepting requests");

  const availableRide = await prisma.rides.findFirst({
    where: { rideID, seatsAvailable: { gt: 0 } },
    select: { rideStatus: true },
  });
  if (!availableRide) throw new RequestError("This ride has no available seats");

  await prisma.requests.create({
    data: {
      rideID,
      createdBy: ride.createdBy,
      rideStatus: ride.rideStatus,
      requestBy,
      requestStatus: "Pending",
    },
  });

  return "RequestMade";
}

/**
 * Accept or Reject a received request.
 * - Verifies the caller is the ride owner.
 * - If Accepted, decrements seatsAvailable inside a transaction.
 */
export async function handleUserReceivedRequest({
  rideID,
  requestBy,
  flag,
  ownerID,
}: ReceivedRequestParams): Promise<void> {
  if (!["Accepted", "Rejected"].includes(flag)) {
    throw new RequestError("Request action must be Accepted or Rejected");
  }

  await prisma.$transaction(async (tx) => {
    const ride = await tx.rides.findUnique({ where: { rideID }, select: { createdBy: true } });
    if (!ride) throw new RequestError(`Ride ${rideID} not found`, 404);
    if (ride.createdBy !== ownerID) throw new RequestError("Only the ride owner can handle requests", 403);

    const request = await tx.requests.findFirst({ where: { rideID, requestBy, requestStatus: "Pending" } });
    if (!request) throw new RequestError("Pending request not found", 404);

    if (flag === "Accepted") {
      const seatUpdate = await tx.rides.updateMany({
        where: { rideID, seatsAvailable: { gt: 0 }, rideStatus: "Pending" },
        data: { seatsAvailable: { decrement: 1 } },
      });
      if (seatUpdate.count !== 1) throw new RequestError("This ride has no available seats");
    }

    await tx.requests.update({ where: { id: request.id }, data: { requestStatus: flag } });
  });
}

/**
 * Get all Pending requests sent by the user (requestBy)
 * for rides that are still Pending.
 */
export async function getSentRequests({ requestBy }: { requestBy: number }) {
  try {
    return await prisma.requests.findMany({
      where: {
        requestBy,
        requestStatus: "Pending",
        ride: { rideStatus: "Pending" },
      },
      include: { ride: true },
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

/**
 * Get all Pending requests received on rides created by the user (createdBy).
 */
export async function getReceivedRequests({ createdBy }: { createdBy: number }) {
  try {
    return await prisma.requests.findMany({
      where: {
        createdBy,
        requestStatus: "Pending",
        ride: { rideStatus: "Pending" },
      },
      include: {
        ride: true,
        requester: { select: { id: true, name: true, email: true, picture: true } },
      },
    });
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

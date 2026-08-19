import { prisma } from "../config/prisma.js";
import { logger } from "../config/logger.js";

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
 * - If previously Rejected/Left, delete the old row and create a fresh Pending one.
 * Returns a status string describing the outcome.
 *
 * Wrapped in a $transaction to prevent a race condition where two concurrent
 * requests could both pass the seat-availability check before either is committed.
 */
export async function handleUserSentRequest({ rideID, requestBy }: SentRequestParams): Promise<string> {
  return prisma.$transaction(async (tx) => {
    // Check for an existing request for this ride by this user
    const existing = await tx.requests.findFirst({ where: { rideID, requestBy } });

    if (existing) {
      if (existing.requestStatus === "Accepted") return "Accepted";
      if (existing.requestStatus === "Pending") return "Pending";
      // Rejected or Left — allow re-request by deleting the old row first
      await tx.requests.delete({ where: { id: existing.id } });
    }

    // Look up the ride inside the same transaction for consistency
    const ride = await tx.rides.findUnique({
      where: { rideID },
      select: { createdBy: true, rideStatus: true, seatsAvailable: true },
    });

    if (!ride) throw new RequestError(`Ride ${rideID} not found`, 404);
    if (ride.createdBy === requestBy) throw new RequestError("You cannot join your own ride");
    if (ride.rideStatus !== "Pending") throw new RequestError("This ride is no longer accepting requests");
    if (ride.seatsAvailable <= 0) throw new RequestError("This ride has no available seats");

    await tx.requests.create({
      data: {
        rideID,
        createdBy: ride.createdBy,
        rideStatus: ride.rideStatus,
        requestBy,
        requestStatus: "Pending",
      },
    });

    logger.info(`Ride request created: rideID=${rideID} requestBy=${requestBy}`);
    return "RequestMade";
  });
}

/**
 * Accept or Reject a received request.
 * - Verifies the caller is the ride owner.
 * - If Accepted, decrements seatsAvailable inside a transaction.
 * Note: flag validation is done at the controller boundary before reaching here.
 */
export async function handleUserReceivedRequest({
  rideID,
  requestBy,
  flag,
  ownerID,
}: ReceivedRequestParams): Promise<void> {
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
    logger.info(`Request ${flag}: rideID=${rideID} requestBy=${requestBy} ownerID=${ownerID}`);
  });
}

/**
 * Get all Pending requests sent by the user for rides that are still Pending.
 */
export async function getSentRequests({ requestBy }: { requestBy: number }) {
  return prisma.requests.findMany({
    where: {
      requestBy,
      requestStatus: "Pending",
      ride: { rideStatus: "Pending" },
    },
    include: { ride: true },
  });
}

/**
 * Get all Pending requests received on rides created by the user.
 */
export async function getReceivedRequests({ createdBy }: { createdBy: number }) {
  return prisma.requests.findMany({
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
}

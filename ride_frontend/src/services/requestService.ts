import {
  sendRequestApi,
  handleRequestApi,
  getRequestsSentApi,
  getRequestsReceivedApi,
} from "../api/requestApi";
import { RideRequest, HandleRequestPayload } from "../types";

/**
 * Service Layer — Ride Requests
 * Wraps request API calls with error handling and business logic.
 */

/**
 * Sends a join request for a specific ride.
 * Throws on failure so the hook can set an error state.
 */
export const sendRideRequest = async (rideId: string): Promise<void> => {
  const rideID = Number(rideId);
  if (!Number.isInteger(rideID) || rideID <= 0) {
    throw new Error("Invalid ride ID");
  }
  await sendRequestApi({ rideID });
};

/**
 * Accepts or rejects a ride join request.
 * Throws on failure so the hook can set an error state.
 */
export const handleRideRequest = async (payload: HandleRequestPayload): Promise<void> => {
  await handleRequestApi(payload);
};

/**
 * Returns all ride requests the user has sent.
 */
export const getSentRequests = async (): Promise<RideRequest[]> => {
  try {
    return await getRequestsSentApi();
  } catch (error) {
    console.error("[requestService] Failed to fetch sent requests:", error);
    return [];
  }
};

/**
 * Returns all ride requests the user has received (as a driver).
 */
export const getReceivedRequests = async (): Promise<RideRequest[]> => {
  try {
    return await getRequestsReceivedApi();
  } catch (error) {
    console.error("[requestService] Failed to fetch received requests:", error);
    return [];
  }
};

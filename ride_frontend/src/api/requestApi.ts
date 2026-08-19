import axiosInstance from "./axiosInstance";
import { RideRequest, HandleRequestPayload } from "../types";

/**
 * API Layer — Ride Requests
 * Raw HTTP calls to /request/* endpoints.
 *
 * The backend wraps responses in { success: boolean, data: T }.
 * We unwrap .data here so the service/hook layers get plain values.
 */

/** Send a join request for a ride */
export const sendRequestApi = async (data: { rideID: number }): Promise<void> => {
  await axiosInstance.post("/request/sendRequest", data);
};

/** Accept or reject a received join request */
export const handleRequestApi = async (data: HandleRequestPayload): Promise<void> => {
  await axiosInstance.post("/request/handleRequest", data);
};

/** Get all ride join requests the user has sent */
export const getRequestsSentApi = async (): Promise<RideRequest[]> => {
  const response = await axiosInstance.post<{ success: boolean; data: RideRequest[] }>("/request/requestsSent", {});
  return response.data.data ?? [];
};

/** Get all ride join requests the user has received */
export const getRequestsReceivedApi = async (): Promise<RideRequest[]> => {
  const response = await axiosInstance.post<{ success: boolean; data: RideRequest[] }>("/request/requestReceived", {});
  return response.data.data ?? [];
};

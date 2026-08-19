import axiosInstance from "./axiosInstance";
import { AuthStatusResponse } from "../types";

/**
 * API Layer — Auth
 * Raw HTTP calls to /auth/* endpoints.
 * No business logic here — only axios calls and typed responses.
 */

/** Check whether the user currently has a valid session */
export const getAuthStatus = async (): Promise<AuthStatusResponse> => {
  const response = await axiosInstance.get<AuthStatusResponse>("/auth/status");
  return response.data;
};

/** Destroy the server-side session */
export const logoutRequest = async (): Promise<void> => {
  await axiosInstance.get("/auth/logout");
};

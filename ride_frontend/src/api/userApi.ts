import axiosInstance from "./axiosInstance";
import { UserProfile } from "../types";

/**
 * API Layer — User
 * Raw HTTP calls to /user/* endpoints.
 */

/** Fetch the currently authenticated user's profile */
export const getUserProfile = async (): Promise<any> => {
  const response = await axiosInstance.get<{ success: boolean; data: any }>("/user/profile");
  return response.data.data ?? response.data;
};

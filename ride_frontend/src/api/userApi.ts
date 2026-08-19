import axiosInstance from "./axiosInstance";
import { UserProfile } from "../types";

/**
 * API Layer — User
 * Raw HTTP calls to /user/* endpoints.
 */

/** Fetch the currently authenticated user's profile */
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await axiosInstance.get<UserProfile>("/user/profile");
  return response.data;
};

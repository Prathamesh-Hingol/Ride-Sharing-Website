import {
  fetchAvailableRides,
  fetchFilteredRides,
  addRide,
  fetchPendingRides,
  fetchCompletedRides,
  cancelRide,
  leaveRide,
  fetchRideGroup,
  RideGroup,
} from "../api/rideApi";
import { Ride, RideFilters, NewRidePayload } from "../types";

/**
 * Service Layer — Rides
 * Wraps API calls with business logic, data normalization, and error handling.
 * Hooks call service functions — never the API layer directly.
 */

/**
 * Returns all available (pending) rides from the backend.
 * Returns an empty array on error so the UI never breaks.
 */
export const getAvailableRides = async (): Promise<Ride[]> => {
  try {
    return await fetchAvailableRides();
  } catch (error) {
    console.error("[rideService] Failed to fetch available rides:", error);
    return [];
  }
};

/**
 * Returns rides filtered by from/to/date/time criteria.
 * Falls back to fetching all rides if the filtered endpoint fails.
 */
export const getFilteredRides = async (filters: RideFilters): Promise<Ride[]> => {
  try {
    return await fetchFilteredRides(filters);
  } catch (error) {
    console.error("[rideService] Failed to fetch filtered rides:", error);
    return [];
  }
};

/**
 * Creates a new ride offering.
 * Throws on failure — the hook will catch and set an error state.
 */
export const postRide = async (rideData: NewRidePayload): Promise<Ride> => {
  return await addRide(rideData);
};

/**
 * Returns the current user's upcoming (pending) rides for the Profile page.
 */
export const getUserUpcomingRides = async (): Promise<Ride[]> => {
  try {
    return await fetchPendingRides();
  } catch (error) {
    console.error("[rideService] Failed to fetch upcoming rides:", error);
    return [];
  }
};

/**
 * Returns the current user's completed rides for the Profile page.
 */
export const getUserCompletedRides = async (): Promise<Ride[]> => {
  try {
    return await fetchCompletedRides();
  } catch (error) {
    console.error("[rideService] Failed to fetch completed rides:", error);
    return [];
  }
};

export const cancelUserRide = (rideID: number) => cancelRide(rideID);
export const leaveUserRide = (rideID: number) => leaveRide(rideID);
export const getRideGroup = (rideID: number): Promise<RideGroup> => fetchRideGroup(rideID);

import { useState, useEffect, useCallback } from "react";
import {
  getAvailableRides,
  getFilteredRides,
  postRide,
  getUserUpcomingRides,
  getUserCompletedRides,
} from "../services/rideService";
import { Ride, RideFilters, NewRidePayload } from "../types";

/**
 * Hook Layer — useRides
 *
 * Manages ride data state for pages that need to display or create rides.
 * Calls the rideService (never the API layer directly).
 *
 * Usage in Find.tsx:
 *   const { rides, loading, error, fetchRides } = useRides();
 *
 * Usage in Profile.tsx (upcoming rides):
 *   const { upcomingRides, completedRides, loading } = useRides({ mode: 'profile' });
 *
 * Usage in Offer.tsx:
 *   const { submitRide, loading, error } = useRides();
 */
export function useRides(mode: "find" | "profile" | "none" = "none") {
  // Rides shown on the Find page
  const [rides, setRides] = useState<Ride[]>([]);
  // Rides for the Profile page
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks whether a ride post (Offer.tsx) succeeded
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  /**
   * Fetch all available rides, optionally applying filters.
   * Called from Find.tsx on mount and on filter change.
   */
  const fetchRides = useCallback(async (filters?: RideFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = filters && Object.values(filters).some(Boolean)
        ? await getFilteredRides(filters)
        : await getAvailableRides();
      setRides(data);
    } catch {
      setError("Failed to load rides. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch the current user's upcoming + completed rides.
   * Called from Profile.tsx on mount.
   */
  const fetchProfileRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcoming, completed] = await Promise.all([
        getUserUpcomingRides(),
        getUserCompletedRides(),
      ]);
      setUpcomingRides(upcoming);
      setCompletedRides(completed);
    } catch {
      setError("Failed to load your rides.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit a new ride (Offer.tsx form submit handler).
   * Returns true on success, false on failure.
   */
  const submitRide = async (rideData: NewRidePayload): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSubmitSuccess(false);
    try {
      await postRide(rideData);
      setSubmitSuccess(true);
      return true;
    } catch {
      setError("Failed to post ride. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount based on which page is using the hook
  useEffect(() => {
    if (mode === "find") fetchRides();
    if (mode === "profile") fetchProfileRides();
  }, [mode, fetchRides, fetchProfileRides]);

  return {
    // Find page
    rides,
    fetchRides,
    // Profile page
    upcomingRides,
    completedRides,
    fetchProfileRides,
    // Offer page
    submitRide,
    submitSuccess,
    // Shared
    loading,
    error,
  };
}

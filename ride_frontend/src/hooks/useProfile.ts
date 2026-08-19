import { useState, useEffect } from "react";
import { fetchUserProfile } from "../services/userService";
import { UserProfile } from "../types";

/**
 * Hook Layer — useProfile
 *
 * Fetches and manages the authenticated user's profile data.
 * Used by Profile.tsx to display name, email, and avatar.
 *
 * Usage:
 *   const { profile, loading, error } = useProfile();
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile();
        setProfile(data);
      } catch {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []); // Runs once on mount — profile doesn't change during a session

  return { profile, loading, error };
}

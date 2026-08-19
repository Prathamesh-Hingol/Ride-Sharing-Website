import { useState, useEffect, useCallback } from "react";
import {
  getSentRequests,
  getReceivedRequests,
  sendRideRequest,
  handleRideRequest,
} from "../services/requestService";
import { RideRequest, HandleRequestPayload } from "../types";

/**
 * Hook Layer — useRideRequests
 *
 * Manages all ride join request state.
 * Exposes both lists (sent/received) and action functions.
 *
 * Usage:
 *   const { sentRequests, receivedRequests, loading, error, sendRequest, handleRequest } = useRideRequests();
 */
export function useRideRequests() {
  const [sentRequests, setSentRequests] = useState<RideRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Loads both sent and received requests in parallel */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sent, received] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
      ]);
      setSentRequests(sent);
      setReceivedRequests(received);
    } catch {
      setError("Failed to load ride requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sends a join request for a ride.
   * After success, re-fetches the sent list to keep state fresh.
   */
  const sendRequest = async (rideId: string): Promise<boolean> => {
    setError(null);
    try {
      await sendRideRequest(rideId);
      await fetchRequests(); // refresh state
      return true;
    } catch {
      setError("Failed to send request.");
      return false;
    }
  };

  /**
   * Accepts or rejects a received request.
   * After success, re-fetches to update received list.
   */
  const handleRequest = async (payload: HandleRequestPayload): Promise<boolean> => {
    setError(null);
    try {
      await handleRideRequest(payload);
      await fetchRequests(); // refresh state
      return true;
    } catch {
      setError("Failed to handle request.");
      return false;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    sentRequests,
    receivedRequests,
    loading,
    error,
    sendRequest,
    handleRequest,
    fetchRequests,
  };
}

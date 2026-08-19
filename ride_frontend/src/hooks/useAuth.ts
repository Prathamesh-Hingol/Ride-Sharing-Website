import React from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Hook Layer — useAuth
 *
 * This hook is the ONLY way components and pages access auth state.
 * It reads from AuthContext (which is populated by AuthProvider).
 *
 * Exposes:
 *   - user          → the logged-in User object (or null)
 *   - isAuthenticated → boolean
 *   - loading       → true while the initial auth check is in-flight
 *   - error         → string if logout or auth check failed
 *   - login()       → redirects to Google OAuth (no API call)
 *   - logout()      → destroys session + clears local state
 *   - checkAuthStatus() → re-validates the session on demand
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

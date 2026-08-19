import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types";
import {
  checkAuthStatus,
  logoutUser,
  redirectToGoogleLogin,
} from "../services/authService";

/**
 * UI Layer — AuthProvider
 *
 * Owns the global auth state (user, isAuthenticated, loading, error).
 * Populates AuthContext so any component using useAuth() can read the state.
 *
 * Key behaviour:
 * - Runs checkAuthStatus on mount (restores session after page refresh)
 * - Re-runs checkAuthStatus when the URL contains ?status=success
 *   (this is how we detect the Google OAuth callback redirect back to the frontend)
 * - After logout, always clears local state even if the server call fails
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  /** Calls /auth/status and updates local state accordingly */
  const checkAuthStatusHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      const { isAuthenticated: authed, user: userData } = await checkAuthStatus();
      setIsAuthenticated(authed);
      setUser(userData);
    } catch {
      setError("Auth check failed");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount to restore any existing session (e.g. page refresh)
  useEffect(() => {
    checkAuthStatusHandler();
  }, []);

  // Re-check auth whenever the URL has ?status=success or ?status=already_authenticated.
  // This fires when Google OAuth redirects back to /profile?status=success,
  // which is the ONLY reliable way to know the login just completed.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    if (status === "success" || status === "already_authenticated") {
      checkAuthStatusHandler();
    }
  }, [location.search]);

  /** Redirects to Google OAuth — no API call, just a browser navigation */
  const login = () => {
    redirectToGoogleLogin();
  };

  /** Destroys the server session and clears local auth state */
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      setError("Logout failed");
    } finally {
      // Always clear local state even if the server call fails
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        checkAuthStatus: checkAuthStatusHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

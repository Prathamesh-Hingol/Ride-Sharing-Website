import { getAuthStatus, logoutRequest } from "../api/authApi";
import { AuthStatusResponse } from "../types";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Service Layer — Auth
 * Contains business logic around authentication.
 * Components and hooks NEVER import from api/ directly — they go through services.
 */

/**
 * Checks whether the current session is valid.
 *
 * The backend /auth/status returns:
 *   200 { isAuthenticated: true,  user: {...} } → logged in
 *   401 { isAuthenticated: false, user: null  } → not logged in (normal)
 *
 * Axios throws on 401 (even though we don't redirect for /auth/status).
 * We catch it here and return the body if it exists, or default to
 * unauthenticated for genuine network failures.
 */
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    return await getAuthStatus();
  } catch (err: any) {
    // If the backend explicitly said "not authenticated" (401 with a body),
    // return that response data rather than a fabricated object.
    if (err?.response?.data) {
      return err.response.data as AuthStatusResponse;
    }
    // True network/server failure → treat as unauthenticated
    console.error("[authService] checkAuthStatus failed:", err?.message);
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Terminates the server-side session.
 * Throws on network/server failure so callers can show an error.
 */
export const logoutUser = async (): Promise<void> => {
  await logoutRequest();
};

/**
 * Redirects the browser to the Google OAuth login page on the backend.
 * This is a hard redirect, not an API call.
 */
export const redirectToGoogleLogin = (): void => {
  window.location.href = `${backendUrl}/auth/google`;
};

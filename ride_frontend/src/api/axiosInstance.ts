import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

/**
 * Shared Axios instance used by all API modules.
 * - baseURL is read from the VITE_BACKEND_URL env variable
 * - withCredentials: true sends session cookies on every request
 * - Response interceptor handles global 401 → redirect to /signin
 */
const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // replaces credentials: 'include' everywhere
  headers: {
    "Content-Type": "application/json",
  },
});

// Global response interceptor — handles auth expiry uniformly
axiosInstance.interceptors.response.use(
  (response) => response, // pass through successful responses
  (error) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;

    // /auth/status returning 401 is NORMAL — it just means "not logged in yet"
    // Don't redirect in that case, let authService handle it gracefully.
    // Only redirect on 401 for actual protected API calls.
    if (status === 401 && !url.includes("/auth/status")) {
      window.location.href = "/signin?message=Session+expired,+please+sign+in+again";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

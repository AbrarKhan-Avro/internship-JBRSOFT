// frontend/src/api.js
import axios from "axios";

const DEFAULT_API = "http://localhost:8001/api";
const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

const REFRESH_ENDPOINT = `${BASE_URL}/auth/token/refresh/`;

/**
 * Helper token functions (wrapping localStorage).
 * You can replace these with a more advanced storage if needed.
 */
function getAccessToken() {
  return localStorage.getItem("accessToken");
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}
function setAuthTokens({ access, refresh }) {
  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);
}
function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user"); // optional: clear cached user if you store it
}

/**
 * Create main axios instance used by the app
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: false,
});

/**
 * Request interceptor
 * - Attach Authorization header when access token exists
 */
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      // don't overwrite existing Authorization header if present
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Refresh handling
 *
 * We implement a queue so that multiple requests that receive 401 while a refresh
 * is in progress will wait for the single refresh call to complete, then retry.
 */
let isRefreshing = false;
let refreshQueue = [];

/**
 * Push a request into the queue: returns a promise that resolves/rejects
 * once token refresh finishes.
 */
function enqueueRefreshPromise(resolve, reject) {
  refreshQueue.push({ resolve, reject });
}

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
}

/**
 * Response interceptor
 * - If 401: try to refresh (once) and retry original request
 * - Improve network error messages
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // No response from server (network error)
    if (!error.response) {
      error.message = "Network error or server unreachable. Are backend and docker compose running?";
      return Promise.reject(error);
    }

    const originalRequest = error.config || {};
    const status = error.response.status;

    // If 401 and we haven't retried this request yet, try refresh
    if (status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();

      // If no refresh token, nothing to do — clear auth and reject
      if (!refreshToken) {
        clearAuth();
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        try {
          await new Promise((resolve, reject) => {
            enqueueRefreshPromise(resolve, reject);
          });
          // After refresh completes, retry original request with new token
          originalRequest._retry = true;
          const newAccess = getAccessToken();
          if (newAccess) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          }
          return api(originalRequest);
        } catch (err) {
          // Refresh failed while queued
          return Promise.reject(err);
        }
      }

      // Start refresh flow
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Use plain axios (not api) to avoid loops with interceptors
        const resp = await axios.post(
          REFRESH_ENDPOINT,
          { refresh: refreshToken },
          { timeout: 10000 } // shorter timeout for refresh
        );

        // Expected response: { access: "...", refresh: "..." } (may include refresh)
        const { access, refresh } = resp.data || {};

        if (!access) {
          // refresh didn't return an access token -> treat as failure
          throw new Error("Refresh token response did not include access token.");
        }

        // Save new tokens
        setAuthTokens({ access, refresh: refresh || refreshToken });

        // Update queued requests
        processQueue(null, access);

        // Retry the original request with new access token
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed: clear auth, reject queued requests
        processQueue(refreshError, null);
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other status codes just propagate error (but you can customize messages)
    return Promise.reject(error);
  }
);

// Export the axios instance and token helper functions for app use
export default api;
export { getAccessToken, getRefreshToken, setAuthTokens, clearAuth };

import axios from "axios";

/**
 * Priority:
 * 1) import.meta.env.VITE_API_URL  (recommended: set this in frontend/.env during development or in the build env)
 * 2) fallback to localhost:8001 (your Django host mapping in docker-compose)
 *
 * NOTE about Docker: the frontend runs in the user's browser, so API calls must be reachable from the browser.
 * That usually means using the host's mapped port (e.g. http://localhost:8001/api). Do NOT use "http://backend:8000/api"
 * here because that hostname is only resolvable _inside_ the Docker network, not by the browser.
 */
const DEFAULT_API = "http://localhost:8001/api";
const BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15s
  withCredentials: false,
});

// Simple request logger (helpful while developing)
api.interceptors.request.use((config) => {
  // Uncomment next line to see requests in the console
  // console.debug("[api] Request:", config.method?.toUpperCase(), config.url, config);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Simple response/interceptor to normalize errors
api.interceptors.response.use((res) => res, (error) => {
  // If the server responded with JSON error shape, leave it; otherwise attach message
  if (!error.response) {
    // network / CORS / timeout
    error.message = "Network error or server unreachable. Are backend and docker compose running?";
  }
  return Promise.reject(error);
});

export default api;

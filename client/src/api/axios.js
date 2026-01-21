/**
 * Axios API Client
 *
 * Configured with auth token interceptor to automatically
 * include Firebase ID token in all requests.
 *
 * Uses a promise-based approach to wait for auth state to be ready.
 */
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../config/firebase.config";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/";

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get the current Firebase user, waiting for auth to initialize if needed
 * This handles the case where auth.currentUser is null during initial load
 */
const getCurrentUser = () => {
  return new Promise((resolve) => {
    const auth = getAuth(app);

    // If auth state is already determined, return immediately
    if (auth.currentUser !== undefined) {
      // Give a small timeout to ensure auth is fully initialized
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    } else {
      resolve(auth.currentUser);
    }
  });
};

/**
 * Request interceptor - Adds Firebase auth token to all requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = await getCurrentUser();

      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently continue without token if there's an issue
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default apiClient;

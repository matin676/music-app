/**
 * API Client Configuration
 *
 * Centralized Axios instance with:
 * - Base URL configuration
 * - Request interceptor for auth tokens
 * - Response interceptor for error handling
 * - Standardized response parsing
 */
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Adds auth token to requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silently continue without token if auth fails
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor - Handles errors and normalizes responses
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the data directly (already standardized from server)
    return response.data;
  },
  (error) => {
    // Create standardized error object
    const errorResponse = {
      success: false,
      message: "An unexpected error occurred",
      status: 500,
      data: null,
    };

    if (error.response) {
      // Server responded with an error
      errorResponse.message = error.response.data?.message || error.message;
      errorResponse.status = error.response.status;
      errorResponse.data = error.response.data;
    } else if (error.request) {
      // Request made but no response
      errorResponse.message = "No response from server. Check your connection.";
      errorResponse.status = 0;
    } else {
      // Request setup error
      errorResponse.message = error.message;
    }

    return Promise.reject(errorResponse);
  },
);

export default apiClient;

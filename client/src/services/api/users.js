/**
 * Users API Service
 */
import apiClient from "./client";

export const usersApi = {
  /**
   * Validate user and login/register
   * Token is automatically attached by API client interceptor
   */
  login: async () => {
    const response = await apiClient.get("/api/users/login");
    return response.data;
  },

  /**
   * Get all users (Admin only)
   */
  getAll: async () => {
    const response = await apiClient.get("/api/users/getusers");
    return response.data;
  },

  /**
   * Update user role (Admin only)
   */
  updateRole: async (userId, role) => {
    const response = await apiClient.put(`/api/users/updaterole/${userId}`, {
      data: { role },
    });
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   */
  delete: async (userId) => {
    await apiClient.delete(`/api/users/deleteuser/${userId}`);
  },

  /**
   * Update user profile
   */
  updateProfile: async (userId, profileData) => {
    const response = await apiClient.put(
      `/api/users/updateuser/${userId}`,
      profileData,
    );
    return response.data;
  },

  /**
   * Toggle song in favourites
   */
  toggleFavourite: async (userId, songId) => {
    const response = await apiClient.put(
      `/api/users/updateFavourites/${userId}`,
      { songId },
    );
    return response.data;
  },
};

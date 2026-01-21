/**
 * Songs API Service
 *
 * All API calls related to songs
 * Response format: { success, message, data, timestamp }
 */
import apiClient from "./client";

export const songsApi = {
  /**
   * Get all songs
   * @returns {Promise<Object[]>} Array of songs
   */
  getAll: async () => {
    const response = await apiClient.get("/api/songs/getall");
    return response.data; // Extract data from standardized response
  },

  /**
   * Get a single song by ID
   * @param {string} id - Song ID
   * @returns {Promise<Object>} Song object
   */
  getOne: async (id) => {
    const response = await apiClient.get(`/api/songs/getone/${id}`);
    return response.data;
  },

  /**
   * Create a new song (Admin only)
   * @param {Object} songData - Song data
   * @returns {Promise<Object>} Created song
   */
  create: async (songData) => {
    const response = await apiClient.post("/api/songs/save", songData);
    return response.data;
  },

  /**
   * Update a song (Admin only)
   * @param {string} id - Song ID
   * @param {Object} songData - Updated song data
   * @returns {Promise<Object>} Updated song
   */
  update: async (id, songData) => {
    const response = await apiClient.put(`/api/songs/update/${id}`, songData);
    return response.data;
  },

  /**
   * Delete a song (Admin only)
   * @param {string} id - Song ID
   * @returns {Promise<void>}
   */
  delete: async (id) => {
    await apiClient.delete(`/api/songs/delete/${id}`);
  },
};

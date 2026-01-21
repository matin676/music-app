/**
 * Artists API Service
 */
import apiClient from "./client";

export const artistsApi = {
  getAll: async () => {
    const response = await apiClient.get("/api/artists/getall");
    return response.data;
  },

  getOne: async (id) => {
    const response = await apiClient.get(`/api/artists/getone/${id}`);
    return response.data;
  },

  create: async (artistData) => {
    const response = await apiClient.post("/api/artists/save", artistData);
    return response.data;
  },

  update: async (id, artistData) => {
    const response = await apiClient.put(
      `/api/artists/update/${id}`,
      artistData,
    );
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/api/artists/delete/${id}`);
  },
};

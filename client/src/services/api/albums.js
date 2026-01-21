/**
 * Albums API Service
 */
import apiClient from "./client";

export const albumsApi = {
  getAll: async () => {
    const response = await apiClient.get("/api/albums/getall");
    return response.data;
  },

  getOne: async (id) => {
    const response = await apiClient.get(`/api/albums/getone/${id}`);
    return response.data;
  },

  create: async (albumData) => {
    const response = await apiClient.post("/api/albums/save", albumData);
    return response.data;
  },

  update: async (id, albumData) => {
    const response = await apiClient.put(`/api/albums/update/${id}`, albumData);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/api/albums/delete/${id}`);
  },
};

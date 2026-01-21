/**
 * Playlists API Service
 */
import apiClient from "./client";

export const playlistsApi = {
  getAll: async () => {
    const response = await apiClient.get("/api/playlists/getall");
    return response.data;
  },

  getOne: async (id) => {
    const response = await apiClient.get(`/api/playlists/getplaylist/${id}`);
    return response.data;
  },

  create: async (playlistData) => {
    const response = await apiClient.post(
      "/api/playlists/savePlaylist",
      playlistData,
    );
    return response.data;
  },

  update: async (id, playlistData) => {
    const response = await apiClient.put(
      `/api/playlists/update/${id}`,
      playlistData,
    );
    return response.data;
  },

  addSong: async (playlistId, songId) => {
    const response = await apiClient.put(
      `/api/playlists/update/${playlistId}/add`,
      { songId },
    );
    return response.data;
  },

  removeSong: async (playlistId, songId) => {
    const response = await apiClient.put(
      `/api/playlists/update/${playlistId}/remove`,
      { songId },
    );
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/api/playlists/deleteplaylist/${id}`);
  },
};

import apiClient from "./axios";

export const validateUser = async (token) => {
  try {
    const res = await apiClient.get("api/users/login", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const res = await apiClient.get("api/users/getusers");
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllArtists = async () => {
  try {
    const res = await apiClient.get("api/artists/getall");
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllAlbums = async () => {
  try {
    const res = await apiClient.get("api/albums/getall");
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllSongs = async (params = {}) => {
  try {
    const res = await apiClient.get("api/songs/getall", { params });
    return res.data?.data || [];
  } catch (error) {
    return null;
  }
};

export const getStats = async () => {
  try {
    const res = await apiClient.get("api/songs/stats");
    return res.data?.data || null;
  } catch (error) {
    return null;
  }
};

export const changingUserRole = async (userId, role) => {
  try {
    const res = await apiClient.put(`api/users/updaterole/${userId}`, {
      data: { role: role },
    });
    return res;
  } catch (error) {
    return null;
  }
};

export const removeUser = async (userId) => {
  try {
    const res = await apiClient.delete(`api/users/deleteuser/${userId}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const saveNewSong = async (data) => {
  try {
    const res = await apiClient.post("api/songs/save/", { ...data });
    // New API returns { success, message, data }
    return res.data?.data || res.data;
  } catch (error) {
    return null;
  }
};

export const saveNewArtist = async (data) => {
  try {
    const res = await apiClient.post("api/artists/save/", { ...data });
    // New API returns { success, message, data }
    return res.data?.data || res.data;
  } catch (error) {
    return null;
  }
};

export const saveNewAlbum = async (data) => {
  try {
    const res = await apiClient.post("api/albums/save/", { ...data });
    // New API returns { success, message, data }
    return res.data?.data || res.data;
  } catch (error) {
    return null;
  }
};

export const updateSong = async (id, data) => {
  try {
    const res = await apiClient.put(`api/songs/update/${id}`, { ...data });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const updateArtist = async (id, data) => {
  try {
    const res = await apiClient.put(`api/artists/update/${id}`, { ...data });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const updateAlbum = async (id, data) => {
  try {
    const res = await apiClient.put(`api/albums/update/${id}`, { ...data });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const deleteSongById = async (id) => {
  try {
    const res = await apiClient.delete(`api/songs/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const deleteAlbumById = async (id) => {
  try {
    const res = await apiClient.delete(`api/albums/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const deleteArtistById = async (id) => {
  try {
    const res = await apiClient.delete(`api/artists/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const updateProfileById = async (userId, updatedUserData) => {
  try {
    const res = await apiClient.put(
      `api/users/updateuser/${userId}`,
      updatedUserData,
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

export const savePlaylist = async (playlistData) => {
  try {
    const res = await apiClient.post(
      "api/playlists/savePlaylist",
      playlistData,
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllPlaylist = async () => {
  try {
    const res = await apiClient.get("api/playlists/getall");
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getPlaylistById = async (playlistId) => {
  try {
    const res = await apiClient.get(`api/playlists/getplaylist/${playlistId}`);
    return res.data;
  } catch (error) {
    // Re-throw error to be handled by caller
    throw error;
  }
};

export const deletePlaylistById = async (playlistId) => {
  try {
    const res = await apiClient.delete(
      `api/playlists/deleteplaylist/${playlistId}`,
    );
    return res;
  } catch (error) {
    return null;
  }
};

export const updateUserFavourites = async (userId, songId) => {
  try {
    const res = await apiClient.put(`api/users/updateFavourites/${userId}`, {
      songId,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const updatePlaylist = async (id, data) => {
  try {
    const res = await apiClient.put(`api/playlists/update/${id}`, { ...data });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const res = await apiClient.put(`api/playlists/update/${playlistId}/add`, {
      songId,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const res = await apiClient.put(
      `api/playlists/update/${playlistId}/remove`,
      {
        songId,
      },
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

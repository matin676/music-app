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

export const getAllSongs = async () => {
  try {
    const res = await apiClient.get("api/songs/getall");
    return res.data;
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
    return res.data.savedSong;
  } catch (error) {
    return null;
  }
};

export const saveNewArtist = async (data) => {
  try {
    const res = await apiClient.post("api/artists/save/", { ...data });
    return res.data.savedArtist;
  } catch (error) {
    return null;
  }
};

export const saveNewAlbum = async (data) => {
  try {
    const res = await apiClient.post("api/albums/save/", { ...data });
    return res.data.savedAlbum;
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
      updatedUserData
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
      playlistData
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
    if (error.response && error.response.status === 404) {
      console.error("Playlist not found.");
    } else {
      console.error("Error fetching playlist by ID:", error);
    }
    throw error;
  }
};

export const deletePlaylistById = async (playlistId) => {
  try {
    const res = await apiClient.delete(
      `api/playlists/deleteplaylist/${playlistId}`
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

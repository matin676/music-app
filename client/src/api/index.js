import axios from "axios";

// const baseURL = "http://localhost:4000/";
const baseURL = "https://music-app-zga8.onrender.com/";

export const validateUser = async (token) => {
  try {
    const res = await axios.get(`${baseURL}api/users/login`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    return res.data;
  } catch (error) {}
};

export const getAllUsers = async () => {
  try {
    const res = await axios.get(`${baseURL}api/users/getusers`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllArtists = async () => {
  try {
    const res = await axios.get(`${baseURL}api/artists/getall`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllAlbums = async () => {
  try {
    const res = await axios.get(`${baseURL}api/albums/getall`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllSongs = async () => {
  try {
    const res = await axios.get(`${baseURL}api/songs/getall`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const changingUserRole = async (userId, role) => {
  try {
    const res = axios.put(`${baseURL}api/users/updaterole/${userId}`, {
      data: { role: role },
    });
    return res;
  } catch (error) {
    return null;
  }
};

export const removeUser = async (userId) => {
  try {
    const res = axios.delete(`${baseURL}api/users/deleteuser/${userId}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const saveNewSong = async (data) => {
  try {
    const res = axios.post(`${baseURL}api/songs/save/`, { ...data });
    return (await res).data.savedSong;
  } catch (error) {
    return null;
  }
};

export const saveNewArtist = async (data) => {
  try {
    const res = axios.post(`${baseURL}api/artists/save/`, { ...data });
    return (await res).data.savedArtist;
  } catch (error) {
    return null;
  }
};

export const saveNewAlbum = async (data) => {
  try {
    const res = axios.post(`${baseURL}api/albums/save/`, { ...data });
    return (await res).data.savedAlbum;
  } catch (error) {
    return null;
  }
};

export const deleteSongById = async (id) => {
  try {
    const res = axios.delete(`${baseURL}api/songs/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const deleteAlbumById = async (id) => {
  try {
    const res = axios.delete(`${baseURL}api/albums/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const deleteArtistById = async (id) => {
  try {
    const res = axios.delete(`${baseURL}api/artists/delete/${id}`);
    return res;
  } catch (error) {
    return null;
  }
};

export const updateProfileById = async (userId, updatedUserData) => {
  try {
    const res = await axios.put(
      `${baseURL}api/users/updateuser/${userId}`,
      updatedUserData
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

export const savePlaylist = async (playlistData) => {
  try {
    const res = await axios.post(
      `${baseURL}api/playlists/savePlaylist`,
      playlistData
    );
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getAllPlaylist = async () => {
  try {
    const res = await axios.get(`${baseURL}api/playlists/getall`);
    return res.data;
  } catch (error) {
    return null;
  }
};

export const getPlaylistById = async (playlistId) => {
  try {
    const res = await axios.get(
      `${baseURL}api/playlists/getplaylist/${playlistId}`
    );
    // console.log("Playlist Data:", res.data);
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
    const res = axios.delete(
      `${baseURL}api/playlists/deleteplaylist/${playlistId}`
    );
    return res;
  } catch (error) {
    return null;
  }
};

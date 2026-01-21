import { useCallback } from "react";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import {
  getAllAlbums,
  getAllArtists,
  getAllPlaylist,
  getAllSongs,
  getAllUsers,
} from "../api";

export const useData = () => {
  const [{ allSongs, allArtists, allAlbums, allUsers, playlist }, dispatch] =
    useStateValue();

  const fetchSongs = useCallback(
    async (force = false) => {
      if (!allSongs || force) {
        const data = await getAllSongs();
        if (data) {
          dispatch({
            type: actionType.SET_ALL_SONGS,
            allSongs: data.data,
          });
        }
      }
    },
    [allSongs, dispatch],
  );

  const fetchArtists = useCallback(
    async (force = false) => {
      if (!allArtists || force) {
        const data = await getAllArtists();
        if (data) {
          dispatch({
            type: actionType.SET_ALL_ARTISTS,
            allArtists: data.data,
          });
        }
      }
    },
    [allArtists, dispatch],
  );

  const fetchAlbums = useCallback(
    async (force = false) => {
      if (!allAlbums || force) {
        const data = await getAllAlbums();
        if (data) {
          dispatch({
            type: actionType.SET_ALL_ALBUMS,
            allAlbums: data.data,
          });
        }
      }
    },
    [allAlbums, dispatch],
  );

  const fetchUsers = useCallback(
    async (force = false) => {
      if (!allUsers || force) {
        const data = await getAllUsers();
        if (data) {
          dispatch({
            type: actionType.SET_ALL_USERS,
            allUsers: data.data,
          });
        }
      }
    },
    [allUsers, dispatch],
  );

  const fetchPlaylists = useCallback(async () => {
    if (!playlist) {
      const data = await getAllPlaylist();
      if (data) {
        dispatch({
          type: actionType.SET_ALL_PLAYLISTS,
          playlist: data.data,
        });
      }
    }
  }, [playlist, dispatch]);

  const refreshAllData = useCallback(async () => {
    const [songs, artists, albums, users, playlists] = await Promise.all([
      getAllSongs(),
      getAllArtists(),
      getAllAlbums(),
      getAllUsers(),
      getAllPlaylist(),
    ]);

    if (songs)
      dispatch({ type: actionType.SET_ALL_SONGS, allSongs: songs.data });
    if (artists)
      dispatch({
        type: actionType.SET_ALL_ARTISTS,
        allArtists: artists.data,
      });
    if (albums)
      dispatch({ type: actionType.SET_ALL_ALBUMS, allAlbums: albums.data });
    if (users)
      dispatch({ type: actionType.SET_ALL_USERS, allUsers: users.data });
    if (playlists)
      dispatch({
        type: actionType.SET_ALL_PLAYLISTS,
        playlist: playlists.data,
      });
  }, [dispatch]);

  return {
    fetchSongs,
    fetchArtists,
    fetchAlbums,
    fetchUsers,
    fetchPlaylists,
    refreshAllData,
  };
};

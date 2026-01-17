import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { MdPlayCircle, MdPauseCircle } from "react-icons/md";
import { IoTrash } from "react-icons/io5";

import { motion } from "framer-motion";
import Header from "../Shared/Header";
import { useStateValue } from "../../context/StateProvider";
import {
  getAllSongs,
  getPlaylistById,
  removeSongFromPlaylist,
} from "../../api";
import { actionType } from "../../context/reducer";
import SEO from "../Shared/SEO";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";

import { useData } from "../../hooks/useData";

export default function PlaylistSongs() {
  const { fetchSongs } = useData();
  const [
    { selectedPlaylist, allSongs, songIndex, isSongPlaying, playlist },
    dispatch,
  ] = useStateValue();

  const { id } = useParams();
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const removeSong = (songId) => {
    removeSongFromPlaylist(id, songId).then((res) => {
      if (res.success) {
        setAlert("success");
        setAlertMsg("Song removed from playlist");
        // Optimistically update
        const updatedSongs = selectedPlaylist.songs.filter((item) => {
          if (typeof item === "string") return item !== songId;
          return item.songId !== songId;
        });
        dispatch({
          type: actionType.SET_SELECTED_PLAYLIST,
          selectedPlaylist: { ...selectedPlaylist, songs: updatedSongs },
        });

        // Update global playlist state for Library view
        if (playlist) {
          const updatedAllPlaylists = playlist.map((pl) => {
            if (pl._id === id) {
              return { ...pl, songs: updatedSongs };
            }
            return pl;
          });
          dispatch({
            type: actionType.SET_ALL_PLAYLISTS,
            playlist: updatedAllPlaylists,
          });
        }

        setTimeout(() => setAlert(null), 4000);
      } else {
        setAlert("error");
        setAlertMsg("Failed to remove song");
        setTimeout(() => setAlert(null), 4000);
      }
    });
  };

  const createdAt = selectedPlaylist
    ? moment(new Date(selectedPlaylist.createdAt)).format("MMMM  Do YYYY")
    : "";

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlaylistById(id);
        if (data && data.success) {
          dispatch({
            type: actionType.SET_SELECTED_PLAYLIST,
            selectedPlaylist: data.playlist,
          });
        }
      } catch (error) {
        console.error("Error fetching playlist:", error);
      }
    };

    fetchData();
  }, [id, dispatch]);

  const selectedSongs =
    selectedPlaylist && selectedPlaylist.songs && allSongs
      ? selectedPlaylist.songs
          .map((item) => {
            const songId = typeof item === "string" ? item : item.songId;
            const addedAt =
              typeof item === "string"
                ? selectedPlaylist.createdAt
                : item.addedAt;
            const details = allSongs.find((s) => s._id === songId);
            return details ? { ...details, addedAt: addedAt } : null;
          })
          .filter(Boolean)
      : [];

  const handlePlaySong = (index) => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }

    // Set the current playlist context to the selected songs
    dispatch({
      type: actionType.SET_CURRENT_PLAYLIST,
      currentPlaylist: selectedSongs,
    });

    // Set the song index within this playlist
    dispatch({
      type: actionType.SET_SONG_INDEX,
      songIndex: index,
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-transparent">
      <SEO
        title={selectedPlaylist?.name || "Playlist"}
        description="Discover and play the best tracks in this playlist on MusicApp."
      />
      <Header />

      <main className="w-full flex-1 flex flex-col items-center">
        {selectedPlaylist && (
          <div className="w-full max-w-[1200px] p-3 md:p-4 flex flex-col gap-4 md:gap-8">
            {/* Playlist Header */}
            <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-end p-4 md:p-6 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl md:rounded-3xl shadow-xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 md:w-64 aspect-square rounded-xl md:rounded-2xl shadow-2xl overflow-hidden relative group shrink-0"
              >
                <img
                  src={selectedPlaylist.imageURL}
                  alt={selectedPlaylist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </motion.div>

              <div className="flex flex-col gap-2 flex-1 items-start text-center md:text-left w-full">
                <span className="text-xs md:text-sm font-bold uppercase text-gray-600 tracking-widest">
                  Playlist
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-headingColor drop-shadow-sm leading-tight">
                  {selectedPlaylist.name}
                </h1>
                <p className="text-sm md:text-base text-gray-500 font-medium">
                  Created •{" "}
                  {new Date(selectedPlaylist.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-3 md:gap-4 mt-3 md:mt-4">
                  <button
                    onClick={() => handlePlaySong(0)}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
                  >
                    {isSongPlaying ? (
                      <MdPauseCircle className="text-2xl md:text-3xl text-white" />
                    ) : (
                      <MdPlayCircle className="text-2xl md:text-3xl text-white" />
                    )}
                  </button>
                  <span className="text-base md:text-xl font-medium text-headingColor">
                    {selectedPlaylist.songs?.length || 0} Songs
                  </span>
                </div>
              </div>
            </div>

            {/* Song List */}
            <div className="flex flex-col w-full bg-white/20 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg p-3 md:p-4">
              {/* Table Header */}
              <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-3 md:gap-4 px-3 md:px-4 py-2 border-b border-gray-200/50 text-gray-500 font-semibold text-xs md:text-sm uppercase tracking-wider mb-2">
                <span className="w-8 text-center">#</span>
                <span>Title</span>
                <span className="hidden md:block">Album</span>
                <span className="hidden md:block text-right">Added</span>
                <span className="hidden md:block w-10"></span>
              </div>

              {/* Songs */}
              <div className="flex flex-col gap-2">
                {selectedSongs.map((song, index) => (
                  <motion.div
                    key={song._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-3 md:gap-4 items-center px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl hover:bg-white/40 cursor-pointer transition-colors"
                    onClick={() => handlePlaySong(index)}
                  >
                    <span className="w-8 text-center text-gray-500 font-medium group-hover:hidden">
                      {index + 1}
                    </span>
                    <span className="w-8 text-center hidden group-hover:flex items-center justify-center text-gray-700">
                      <MdPlayCircle className="text-xl" />
                    </span>

                    <div className="flex items-center gap-2 md:gap-4 min-w-0">
                      <img
                        src={song.imageURL}
                        className="w-10 h-10 rounded-md md:rounded-lg object-cover shadow-sm bg-gray-200"
                        alt={song.name}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm md:text-base text-headingColor truncate block">
                          {song.name}
                        </span>
                        <span className="text-xs text-gray-500 md:hidden truncate">
                          {song.artist}
                        </span>
                      </div>
                    </div>

                    <span className="hidden md:block text-gray-600 truncate">
                      {song.album}
                    </span>
                    <span className="hidden md:block text-gray-500 text-sm text-right">
                      {moment(song.addedAt).fromNow()}
                    </span>

                    <motion.i
                      whileTap={{ scale: 0.75 }}
                      className="text-xl text-gray-400 hover:text-red-500 cursor-pointer p-2 ml-auto md:ml-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSong(song._id);
                      }}
                    >
                      <IoTrash />
                    </motion.i>
                  </motion.div>
                ))}
              </div>

              {selectedSongs.length === 0 && (
                <div className="w-full py-10 flex flex-col items-center justify-center text-gray-400">
                  <p className="text-lg">No songs in this playlist yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoClose, IoAdd, IoCheckmark } from "react-icons/io5";

import { getAllPlaylist, addSongToPlaylist } from "../../api";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";

export default function AddToPlaylistModal({ song, closeModal, alertConfig }) {
  const [{ playlist }, dispatch] = useStateValue();
  const [searchTerm, setSearchTerm] = useState("");
  const [localPlaylists, setLocalPlaylists] = useState(playlist || []);

  useEffect(() => {
    if (!playlist) {
      getAllPlaylist().then((data) => {
        dispatch({ type: actionType.SET_ALL_PLAYLISTS, playlist: data.data });
        setLocalPlaylists(data.data);
      });
    } else {
      setLocalPlaylists(playlist);
    }
  }, [playlist, dispatch]);

  const handleAddToPlaylist = (playlistId) => {
    addSongToPlaylist(playlistId, song._id).then((res) => {
      // New API returns { success, message, data }
      if (res?.success || res?.data) {
        alertConfig("success", "Song added to playlist");
        // Update local reference immediately if needed, or rely on fetch
        // Refresh playlists to get updated song counts if we want
        getAllPlaylist().then((data) => {
          dispatch({
            type: actionType.SET_ALL_PLAYLISTS,
            playlist: data?.data || data,
          });
        });
        closeModal();
      } else {
        alertConfig("error", "Failed to add song");
      }
    });
  };

  const filteredPlaylists = localPlaylists.filter((data) => {
    const name = data.name ? data.name.toLowerCase() : "";
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-1000 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-headingColor">
            Add to Playlist
          </h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoClose className="text-xl text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 pt-2">
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full bg-gray-100 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 flex flex-col gap-2">
          {filteredPlaylists.map((data) => (
            <div
              key={data._id}
              className={`flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer ${
                data.songs.some((item) => item.songId === song._id)
                  ? "bg-gray-50 opacity-60 cursor-default"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                const isAdded = data.songs.some(
                  (item) => item.songId === song._id,
                );
                if (!isAdded) {
                  handleAddToPlaylist(data._id);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={data.imageURL}
                  alt={data.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div className="flex flex-col">
                  <p className="font-semibold text-headingColor text-sm">
                    {data.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {data.songs.length} songs
                  </p>
                </div>
              </div>

              {data.songs.some((item) => item.songId === song._id) ? (
                <span className="text-xs font-bold text-green-500 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1">
                  Added <IoCheckmark />
                </span>
              ) : (
                <button className="p-2 rounded-full bg-blue-100 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <IoAdd />
                </button>
              )}
            </div>
          ))}

          {filteredPlaylists.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-4">
              No playlists found.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

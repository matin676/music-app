import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoAdd, IoTrash, IoPencil } from "react-icons/io5";
import { AiOutlineClear } from "react-icons/ai";
import { motion } from "framer-motion";
import { deleteObject, ref } from "firebase/storage";

import { useStateValue } from "../../context/StateProvider";
import { deleteSongById } from "../../api";
import { actionType } from "../../context/reducer";
import { storage } from "../../config/firebase.config";
import SongCard from "../Cards/SongCard";
import { useData } from "../../hooks/useData";
import EditSong from "./EditSong";

// Dashboard Song List Row Component
export const SongListRow = ({ data, index, setSongToEdit }) => {
  const { refreshAllData } = useData();
  const [isDelete, setIsDelete] = useState(false);
  const [{ allSongs, songIndex, isSongPlaying }, dispatch] = useStateValue();

  const deleteData = (data) => {
    // Delete logic refactored for the list row
    const deleteRef = ref(storage, data.imageURL);
    deleteObject(deleteRef).then(() => {});

    const deleteSongRef = ref(storage, data.songURL);
    deleteObject(deleteSongRef).then(() => {});

    deleteSongById(data._id).then((res) => {
      if (res.data) {
        refreshAllData();
      }
    });
  };

  const addToContext = () => {
    if (!isSongPlaying) {
      dispatch({ type: actionType.SET_ISSONG_PLAYING, isSongPlaying: true });
    }
    if (songIndex !== index) {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: index });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative w-full grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] hover:bg-white/50 bg-white/30 backdrop-blur-sm border border-white/40 p-2 md:p-3 rounded-lg shadow-sm gap-2 md:gap-4 items-center group transition-all"
      onClick={addToContext}
    >
      {/* Image */}
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-md md:rounded-lg overflow-hidden relative shadow-sm cursor-pointer shrink-0">
        <img
          src={data.imageURL}
          alt={data.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white animate-pulse" />
        </div>
      </div>

      {/* Name & Artist */}
      <div className="flex flex-col min-w-0">
        <p
          className="text-xs md:text-sm font-bold text-headingColor truncate"
          title={data.name}
        >
          {data.name}
        </p>
        <p
          className="text-[10px] md:text-xs text-gray-500 font-semibold truncate"
          title={data.artist}
        >
          {Array.isArray(data.artist) ? data.artist.join(", ") : data.artist}
        </p>
      </div>

      {/* Album & Category (Desktop) */}
      <div className="hidden md:flex flex-col min-w-0">
        <p className="text-xs text-gray-600 truncate">
          {data.album || "No Album"}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.isArray(data.category) ? (
            data.category.map((cat, i) => (
              <span
                key={i}
                className="text-[10px] uppercase font-bold text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded shadow-sm bg-gray-50"
              >
                {cat}
              </span>
            ))
          ) : (
            <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-300 px-1 rounded w-fit">
              {data.category}
            </span>
          )}
        </div>
      </div>

      {/* Duration (Placeholder if not available in data) */}
      <div className="text-xs text-gray-500 font-bold hidden sm:block">
        3:45
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end relative z-20 shrink-0">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white cursor-pointer transition-colors shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            setIsDelete(true);
          }}
        >
          <IoTrash className="text-xs md:text-sm" />
        </motion.div>

        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-green-500 hover:text-white cursor-pointer transition-colors shadow-sm ml-2"
          onClick={(e) => {
            e.stopPropagation();
            setSongToEdit(data);
          }}
        >
          <IoPencil className="text-xs md:text-sm" />
        </motion.div>

        {/* Delete Confirmation */}
        {isDelete && (
          <div
            className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-white shadow-xl rounded-lg p-3 md:p-4 z-50 border border-gray-100 flex flex-col gap-2 md:gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs md:text-sm text-gray-700 font-semibold text-center">
              Permanently delete{" "}
              <span className="text-headingColor">"{data.name}"</span>?
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-1 px-2 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => deleteData(data)}
              >
                Delete
              </button>
              <button
                className="flex-1 py-1 px-2 text-xs font-bold bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                onClick={() => setIsDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// DashboardSongs Component
export default function DashboardSongs() {
  const { fetchSongs } = useData();
  const [songFilter, setSongFilter] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState(null);
  const [songToEdit, setSongToEdit] = useState(null);
  const [{ allSongs }, dispatch] = useStateValue();

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    if (songFilter.length > 0) {
      const filtered = allSongs.filter(
        (data) => (data) =>
          (data.artist && data.artist.toLowerCase().includes(songFilter)) ||
          (data.language && data.language.toLowerCase().includes(songFilter)) ||
          (data.name && data.name.toLowerCase().includes(songFilter))
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [songFilter]);

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Toolbar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-white/40 px-6 py-4 rounded-xl shadow-sm">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-lg font-bold text-headingColor">
            Songs Library
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Total: {filteredSongs ? filteredSongs?.length : allSongs?.length}{" "}
            songs
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search */}
          <div
            className={`flex items-center gap-2 px-4 py-2 bg-white rounded-full border ${
              isFocus
                ? "border-blue-400 ring-2 ring-blue-100"
                : "border-gray-200"
            } transition-all duration-200 w-full md:w-auto`}
          >
            <input
              className="w-full md:w-64 bg-transparent outline-none text-sm font-medium text-headingColor placeholder-gray-400"
              type="text"
              placeholder="Search songs..."
              value={songFilter}
              onChange={(e) => setSongFilter(e.target.value)}
              onBlur={() => setIsFocus(false)}
              onFocus={() => setIsFocus(true)}
            />
            {songFilter && (
              <AiOutlineClear
                className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors"
                onClick={() => {
                  setSongFilter("");
                  setFilteredSongs(null);
                }}
              />
            )}
          </div>

          {/* Add Button */}
          <NavLink
            to={"/dashboard/newSong"}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-blue-500/40 transition-all text-sm font-bold gap-2"
            title="Add New Song"
          >
            <IoAdd className="text-lg" />
            <span className="hidden md:block">Add Song</span>
          </NavLink>
        </div>
      </div>

      {/* List Container */}
      <div className="w-full flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/50 mb-2">
          <span className="w-12">Cover</span>
          <span>Track Details</span>
          <span>Album & Category</span>
          <span>Duration</span>
          <span className="text-right">Action</span>
        </div>

        <div className="flex flex-col gap-2 relative">
          {filteredSongs !== null
            ? filteredSongs.map((song, i) => (
                <SongListRow
                  key={song._id}
                  data={song}
                  index={i}
                  setSongToEdit={setSongToEdit}
                />
              ))
            : allSongs?.map((song, i) => (
                <SongListRow
                  key={song._id}
                  data={song}
                  index={i}
                  setSongToEdit={setSongToEdit}
                />
              ))}

          {/* Empty State */}
          {((filteredSongs && filteredSongs.length === 0) ||
            (!allSongs && !filteredSongs)) && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
              <p>No songs found.</p>
            </div>
          )}
        </div>
      </div>

      {songToEdit && (
        <EditSong
          data={songToEdit}
          close={() => setSongToEdit(null)}
          refreshData={() => fetchSongs(true)}
        />
      )}
    </div>
  );
}

export const SongContainer = ({ data }) => {
  return (
    <div className="w-full flex flex-wrap gap-3 items-center justify-evenly">
      {data &&
        data.map((song, i) => (
          <SongCard key={song._id} data={song} index={i} type="song" />
        ))}
    </div>
  );
};

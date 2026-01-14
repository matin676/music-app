import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoTrash } from "react-icons/io5";
import { deleteObject, ref } from "firebase/storage";

import { useStateValue } from "../context/StateProvider";
import { deleteAlbumById } from "../api";
import { actionType } from "../context/reducer";
import { storage } from "../config/firebase.config";
import AlbumCard from "./AlbumCard";
import { useData } from "../hooks/useData";

// Album List Row Component
export const AlbumListRow = ({ data, index }) => {
  const { refreshAllData } = useData();
  const [isDelete, setIsDelete] = useState(false);
  const [{ allAlbums }, dispatch] = useStateValue();

  const deleteData = (data) => {
    const deleteRef = ref(storage, data.imageURL);
    deleteObject(deleteRef).then(() => {});

    deleteAlbumById(data._id).then((res) => {
      if (res.data) {
        refreshAllData();
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative w-full grid grid-cols-[auto_1fr_auto] hover:bg-white/50 bg-white/30 backdrop-blur-sm border border-white/40 p-3 rounded-lg shadow-sm gap-4 items-center group transition-all"
    >
      {/* Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden relative shadow-sm">
        <img
          src={data.imageURL}
          alt={data.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Name */}
      <div className="flex flex-col min-w-0">
        <p className="text-sm font-bold text-headingColor truncate">
          {data.name}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end relative z-20">
        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-red-500 hover:text-white cursor-pointer transition-colors shadow-sm"
          onClick={() => setIsDelete(true)}
        >
          <IoTrash className="text-sm" />
        </motion.div>

        {/* Delete Confirmation */}
        {isDelete && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg p-4 z-50 border border-gray-100 flex flex-col gap-3">
            <p className="text-sm text-gray-700 font-semibold text-center">
              Delete album{" "}
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

export default function DashboardAlbums() {
  const { fetchAlbums } = useData();
  const [{ allAlbums }, dispatch] = useStateValue();

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border border-white/40 rounded-xl shadow-sm">
        <div className="flex flex-col">
          <p className="text-lg font-bold text-headingColor">Albums</p>
          <p className="text-xs text-gray-500">Manage your music albums</p>
        </div>
        <span className="px-4 py-1 bg-white text-headingColor font-bold rounded-lg shadow-sm border border-gray-100">
          Total: {allAlbums?.length || 0}
        </span>
      </div>

      {/* List Container */}
      <div className="w-full flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/50 mb-2">
          <span className="w-12">Cover</span>
          <span>Album Details</span>
          <span className="text-right">Action</span>
        </div>

        <div className="flex flex-col gap-2">
          {allAlbums &&
            allAlbums.map((album, i) => (
              <AlbumListRow key={album._id} data={album} index={i} />
            ))}
        </div>

        {(!allAlbums || allAlbums.length === 0) && (
          <div className="w-full py-20 flex justify-center text-gray-400">
            No albums found
          </div>
        )}
      </div>
    </div>
  );
}

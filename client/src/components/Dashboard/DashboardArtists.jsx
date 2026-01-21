/**
 * DashboardArtists Component
 *
 * Admin dashboard for managing artists.
 * Uses React Query for data fetching with automatic cache invalidation.
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoLogoInstagram, IoTrash, IoPencil } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { deleteObject, ref } from "firebase/storage";
import toast from "react-hot-toast";

import { storage } from "../../config/firebase.config";
import { useArtists, useDeleteArtist } from "../../features/library/hooks";
import EditArtist from "./EditArtist";
import { Skeleton } from "../../shared/components";

// Artist List Row Component
export const ArtistListRow = ({ data, index, setArtistToEdit, onDelete }) => {
  const [isDelete, setIsDelete] = useState(false);

  const handleDelete = async () => {
    try {
      // Delete image from Firebase Storage
      const deleteRef = ref(storage, data.imageURL);
      await deleteObject(deleteRef).catch(() => {});

      // Delete from database using mutation
      await onDelete(data._id);
      setIsDelete(false);
      toast.success(`"${data.name}" deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete artist");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative w-full grid grid-cols-[auto_1fr_auto_auto] hover:bg-white/50 bg-white/30 backdrop-blur-sm border border-white/40 p-3 rounded-lg shadow-sm gap-4 items-center group transition-all"
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
        <p className="text-[10px] text-gray-500 font-semibold uppercase">
          id:{" "}
          <span className="text-gray-400 font-normal">
            {data._id.slice(-6)}
          </span>
        </p>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-3">
        {data.instagram && (
          <a
            href={`https://instagram.com/${data.instagram}`}
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-pink-600 transition-colors"
          >
            <IoLogoInstagram className="text-lg" />
          </a>
        )}
        {data.twitter && (
          <a
            href={`https://x.com/${data.twitter}`}
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <FaXTwitter className="text-lg" />
          </a>
        )}
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

        <motion.div
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-green-500 hover:text-white cursor-pointer transition-colors shadow-sm ml-2"
          onClick={() => setArtistToEdit(data)}
        >
          <IoPencil className="text-sm" />
        </motion.div>

        {/* Delete Confirmation */}
        {isDelete && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-xl rounded-lg p-4 z-50 border border-gray-100 flex flex-col gap-3">
            <p className="text-sm text-gray-700 font-semibold text-center">
              Delete artist{" "}
              <span className="text-headingColor">"{data.name}"</span>?
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-1 px-2 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
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

export default function DashboardArtists() {
  const [artistToEdit, setArtistToEdit] = useState(null);

  // React Query hooks
  const { data: artists, isLoading, refetch } = useArtists();
  const deleteArtistMutation = useDeleteArtist();

  return (
    <div className="w-full flex flex-col gap-6 p-4">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-4 bg-white/40 backdrop-blur-md border border-white/40 rounded-xl shadow-sm">
        <div className="flex flex-col">
          <p className="text-lg font-bold text-headingColor">Artists</p>
          <p className="text-xs text-gray-500">Manage your artist database</p>
        </div>
        <span className="px-4 py-1 bg-white text-headingColor font-bold rounded-lg shadow-sm border border-gray-100">
          Total: {artists?.length || 0}
        </span>
      </div>

      {/* List Container */}
      <div className="w-full flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/50 mb-2">
          <span className="w-12">Image</span>
          <span>Artist Details</span>
          <span>Socials</span>
          <span className="text-right">Action</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Loading Skeletons */}
          {isLoading &&
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-full grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 bg-white/30 rounded-lg"
              >
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="w-32 h-4" variant="text" />
                  <Skeleton className="w-16 h-3" variant="text" />
                </div>
                <Skeleton className="w-12 h-6" variant="rect" />
                <Skeleton className="w-16 h-8" variant="rect" />
              </div>
            ))}

          {/* Artists List */}
          {!isLoading &&
            artists?.map((artist, i) => (
              <ArtistListRow
                key={artist._id}
                data={artist}
                index={i}
                setArtistToEdit={setArtistToEdit}
                onDelete={(id) => deleteArtistMutation.mutateAsync(id)}
              />
            ))}
        </div>

        {/* Empty State */}
        {!isLoading && (!artists || artists.length === 0) && (
          <div className="w-full py-20 flex justify-center text-gray-400">
            No artists found
          </div>
        )}
      </div>

      {artistToEdit && (
        <EditArtist
          data={artistToEdit}
          close={() => setArtistToEdit(null)}
          refreshData={() => refetch()}
        />
      )}
    </div>
  );
}

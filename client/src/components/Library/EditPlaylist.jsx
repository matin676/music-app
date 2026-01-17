import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoClose, IoCloudUpload, IoTrash } from "react-icons/io5";
import { MdCheck } from "react-icons/md";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import { storage } from "../../config/firebase.config";
import { updatePlaylist } from "../../api";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";

export default function EditPlaylist({
  data,
  refreshData,
  closeModal,
  alertConfig,
}) {
  const [{ user }, dispatch] = useStateValue();
  const [playlistName, setPlaylistName] = useState(data.name);
  const [playlistImage, setPlaylistImage] = useState(data.imageURL);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const deleteImageObject = (songURL) => {
    setIsImageLoading(true);
    const deleteRef = ref(storage, songURL);
    deleteObject(deleteRef).then(() => {
      setPlaylistImage(null);
      setIsImageLoading(false);
      alertConfig("success", "Image removed successfully");
    });
  };

  const uploadImage = (e) => {
    setIsImageLoading(true);
    const imageFile = e.target.files[0];
    const storageRef = ref(storage, `Images/${Date.now()}-${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setUploadProgress(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      (error) => {
        setIsImageLoading(false);
        alertConfig("error", "Error uploading image");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setPlaylistImage(downloadURL);
          setIsImageLoading(false);
          setUploadProgress(0);
          alertConfig("success", "Image uploaded successfully");
        });
      }
    );
  };

  const saveUpdates = () => {
    if (!playlistName || !playlistImage) {
      alertConfig("error", "Required fields are missing");
      return;
    }

    const updatedData = {
      name: playlistName,
      imageURL: playlistImage,
    };

    updatePlaylist(data._id, updatedData).then((res) => {
      if (res.success) {
        alertConfig("success", "Playlist updated successfully");
        refreshData();
        closeModal();
      } else {
        alertConfig("error", "Failed to update playlist");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative flex flex-col gap-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-headingColor">Edit Playlist</h2>
          <button
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <IoClose className="text-2xl text-gray-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Playlist Name"
            className="w-full text-base font-semibold text-headingColor outline-none border-b-2 border-gray-200 p-2 focus:border-blue-500 transition-colors bg-transparent placeholder:text-gray-400"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />

          {/* Image Uploader */}
          <div className="bg-card w-full h-[200px] rounded-md border-2 border-dotted border-gray-300 cursor-pointer overflow-hidden relative group">
            {isImageLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-t-red-500 animate-spin"></div>
                <p className="text-sm text-gray-500">
                  {Math.round(uploadProgress)}% Uploaded
                </p>
              </div>
            ) : !playlistImage ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex flex-col justify-center items-center cursor-pointer">
                    <p className="text-bold text-2xl text-gray-400">
                      <IoCloudUpload />
                    </p>
                    <p className="text-sm text-gray-400">
                      Click to upload image
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  accept="image/*"
                  onChange={uploadImage}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={playlistImage}
                  alt="uploaded image"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md duration-500 transition-all ease-in-out"
                  onClick={() => deleteImageObject(playlistImage)}
                >
                  <IoTrash className="text-white" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 mt-2">
          <button
            onClick={saveUpdates}
            className="px-8 py-2 w-full rounded-md text-white bg-red-600 hover:bg-red-700 hover:shadow-lg transition-all ease-in-out duration-200"
          >
            Update Playlist
          </button>
        </div>
      </motion.div>
    </div>
  );
}

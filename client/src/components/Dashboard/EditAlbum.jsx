import React, { useState, useRef, useEffect } from "react";
import { ref, deleteObject } from "firebase/storage";
import { motion } from "framer-motion";
import { MdDelete, MdClose } from "react-icons/md";

import { storage } from "../../config/firebase.config";
import { updateAlbum } from "../../api";
import { actionType } from "../../context/reducer";
import { useStateValue } from "../../context/StateProvider";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";
// Reusing components from DashboardNewSong
import { FileLoader, FileUploader, DisabledButton } from "./DashboardNewSong";

const EditAlbum = ({ data, close, refreshData }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [albumName, setAlbumName] = useState(data?.name || "");
  const [albumCoverImage, setAlbumCoverImage] = useState(
    data?.imageURL || null
  );

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const deleteImageObject = (url) => {
    setIsImageLoading(true);
    setAlbumCoverImage(null);

    const deleteRef = ref(storage, url);
    deleteObject(deleteRef).then(() => {
      setAlert("success");
      setAlertMsg("File removed successfully");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsImageLoading(false);
    });
  };

  const updateAlbumData = () => {
    if (!albumCoverImage || !albumName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setIsImageLoading(true);

      const updatedData = {
        name: albumName,
        imageURL: albumCoverImage,
      };

      updateAlbum(data._id, updatedData).then((res) => {
        if (res) {
          refreshData();
          setAlert("success");
          setAlertMsg("Data updated successfully");
          setTimeout(() => {
            close();
          }, 2000);
        } else {
          setAlert("error");
          setAlertMsg("Failed to update data");
          setIsImageLoading(false);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-headingColor">Edit Album</p>
          <MdClose
            className="text-2xl text-gray-400 hover:text-gray-700 cursor-pointer"
            onClick={close}
          />
        </div>

        {/* Image Uploader */}
        <div className="bg-gray-50 backdrop-blur-sm w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-100 transition-all cursor-pointer relative overflow-hidden">
          {isImageLoading && <FileLoader progress={uploadProgress} />}
          {!isImageLoading && (
            <>
              {!albumCoverImage ? (
                <FileUploader
                  setImageURL={setAlbumCoverImage}
                  setAlert={setAlert}
                  alertMsg={setAlertMsg}
                  isLoading={setIsImageLoading}
                  setProgress={setUploadProgress}
                  isImage={true}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={albumCoverImage}
                    alt="uploaded pic"
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-red-500 text-lg cursor-pointer outline-none hover:shadow-md transition-all text-white"
                    onClick={() => {
                      deleteImageObject(albumCoverImage);
                    }}
                  >
                    <MdDelete />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <input
          type="text"
          placeholder="Album Name"
          className="w-full p-3 rounded-lg text-lg font-semibold text-headingColor outline-none shadow-sm border border-gray-200 bg-gray-50 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
        />

        <div className="flex items-center justify-end w-full">
          {isImageLoading ? (
            <DisabledButton />
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-10 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 font-bold transition-all"
              onClick={updateAlbumData}
            >
              Update Album
            </motion.button>
          )}
        </div>

        {alert && (
          <div className="absolute top-4 left-0 right-0 w-full flex justify-center z-50">
            {alert === "success" ? (
              <AlertSuccess msg={alertMsg} />
            ) : (
              <AlertError msg={alertMsg} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAlbum;

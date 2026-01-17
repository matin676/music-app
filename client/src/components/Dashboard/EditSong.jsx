import React, { useState, useRef, useEffect } from "react";
import { ref, deleteObject } from "firebase/storage";
import { motion } from "framer-motion";
import { MdDelete, MdClose } from "react-icons/md";

import { storage } from "../../config/firebase.config";
import { useStateValue } from "../../context/StateProvider";
import { useData } from "../../hooks/useData";
import { updateSong } from "../../api";
import { actionType } from "../../context/reducer";
import { filterByLanguage, filters } from "../../utils/supportfunctions";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";
import FilterButtons from "../Shared/FilterButtons";
// Reusing components from DashboardNewSong
import { FileLoader, FileUploader, DisabledButton } from "./DashboardNewSong";

const EditSong = ({ data, close, refreshData }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const [songName, setSongName] = useState(data?.name || "");
  const [songImageUrl, setSongImageUrl] = useState(data?.imageURL || null);
  const [audioAsset, setAudioAsset] = useState(data?.songURL || null);

  const timeoutRef = useRef(null);

  const [
    {
      allArtists,
      allAlbums,
      artistFilter,
      albumFilter,
      languageFilter,
      filterTerm,
    },
    dispatch,
  ] = useStateValue();

  // Initialize filters based on existing data
  useEffect(() => {
    // We only set these if the user interacts, but to show current values in FilterButtons,
    // we need to set the global state.
    // WARNING: This interacts with global state, might affect other views if not careful.
    // For this modal, it's acceptable as we are in "Edit Mode".
    // Better approach: FilterButtons expects global state.
    // We should ideally refactor FilterButtons to accept "value" prop, but that's a larger refactor.
    // We will set the global state to match the song's current data.
    dispatch({
      type: actionType.SET_ARTIST_FILTER,
      artistFilter: data?.artist,
    });
    // Ensure artist and category are treated as arrays locally even if string (backward compatibility)
    // Actually dispatch will handle what we pass. If data.artist is string, we should wrap it?
    // The reducer just stores it. FilterButtons logic `Array.isArray` handles it.
    // If we want FilterButtons to show it selected, we need it to be in the array.
    // But let's assume new data is array. Old data is string.
    // We should probably normalize it here.

    // Normalize for initial state to be compatible with multi-select FilterButtons
    const initialArtist = Array.isArray(data?.artist)
      ? data?.artist
      : data?.artist
      ? [data?.artist]
      : [];
    const initialCategory = Array.isArray(data?.category)
      ? data?.category
      : data?.category
      ? [data?.category]
      : [];

    dispatch({
      type: actionType.SET_ARTIST_FILTER,
      artistFilter: initialArtist,
    });
    dispatch({ type: actionType.SET_ALBUM_FILTER, albumFilter: data?.album });
    dispatch({
      type: actionType.SET_LANGUAGE_FILTER,
      languageFilter: data?.language,
    });
    dispatch({ type: actionType.SET_FILTER_TERM, filterTerm: initialCategory });

    // Cleanup on unmount to clear filters
    return () => {
      dispatch({ type: actionType.SET_ARTIST_FILTER, artistFilter: null });
      dispatch({ type: actionType.SET_ALBUM_FILTER, albumFilter: null });
      dispatch({ type: actionType.SET_LANGUAGE_FILTER, languageFilter: null });
      dispatch({ type: actionType.SET_FILTER_TERM, filterTerm: null });
    };
  }, [data, dispatch]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const deleteImageObject = (url, type) => {
    if (type === "image") {
      setIsImageLoading(true);
      setSongImageUrl(null);
    } else {
      setIsAudioLoading(true);
      setAudioAsset(null);
    }

    const deleteRef = ref(storage, url);
    deleteObject(deleteRef).then(() => {
      setAlert("success");
      setAlertMsg("File removed successfully");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsImageLoading(false);
      setIsAudioLoading(false);
    });
  };

  const updateSongData = () => {
    if (!songImageUrl || !audioAsset || !songName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setIsImageLoading(true);
      setIsAudioLoading(true);

      const updatedData = {
        name: songName,
        imageURL: songImageUrl,
        songURL: audioAsset,
        artist: artistFilter, // From global state (managed by FilterButtons)
        album: albumFilter, // From global state
        language: languageFilter, // From global state
        category: filterTerm, // From global state
      };

      updateSong(data._id, updatedData).then((res) => {
        if (res) {
          refreshData(); // Refresh list
          setAlert("success");
          setAlertMsg("Data updated successfully");
          setTimeout(() => {
            close();
          }, 2000);
        } else {
          setAlert("error");
          setAlertMsg("Failed to update data");
          setIsImageLoading(false);
          setIsAudioLoading(false);
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 flex flex-col gap-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-headingColor">Edit Song</p>
          <MdClose
            className="text-2xl text-gray-400 hover:text-gray-700 cursor-pointer"
            onClick={close}
          />
        </div>

        <input
          type="text"
          placeholder="Song Name"
          className="w-full p-3 rounded-lg text-lg font-semibold text-headingColor outline-none shadow-sm border border-gray-200 bg-gray-50 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        />

        <div className="w-full flex md:justify-between items-center gap-3 md:gap-4 flex-wrap">
          <FilterButtons
            filterData={allArtists}
            flag={"Artist"}
            multiple={true}
          />
          <FilterButtons filterData={allAlbums} flag={"Albums"} />
          <FilterButtons filterData={filterByLanguage} flag={"Language"} />
          <FilterButtons
            filterData={filters}
            flag={"Category"}
            multiple={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Uploader */}
          <div className="bg-gray-50 backdrop-blur-sm w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-100 transition-all cursor-pointer relative overflow-hidden">
            {isImageLoading && <FileLoader progress={uploadProgress} />}
            {!isImageLoading && (
              <>
                {!songImageUrl ? (
                  <FileUploader
                    setImageURL={setSongImageUrl}
                    setAlert={setAlert}
                    alertMsg={setAlertMsg}
                    isLoading={setIsImageLoading}
                    setProgress={setUploadProgress}
                    isImage={true}
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={songImageUrl}
                      alt="uploaded pic"
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md hover:scale-105 transition-all text-white"
                      onClick={() => {
                        deleteImageObject(songImageUrl, "image");
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Audio Uploader */}
          <div className="bg-gray-50 backdrop-blur-sm w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-100 transition-all cursor-pointer relative overflow-hidden">
            {isAudioLoading && <FileLoader progress={uploadProgress} />}
            {!isAudioLoading && (
              <>
                {!audioAsset ? (
                  <FileUploader
                    setImageURL={setAudioAsset}
                    setAlert={setAlert}
                    alertMsg={setAlertMsg}
                    isLoading={setIsAudioLoading}
                    setProgress={setUploadProgress}
                    isImage={false}
                  />
                ) : (
                  <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
                    <audio src={audioAsset} controls className="w-[90%] z-10" />
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md hover:scale-105 transition-all text-white z-20"
                      onClick={() => {
                        deleteImageObject(audioAsset, "audio");
                      }}
                    >
                      <MdDelete />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end w-full">
          {isImageLoading || isAudioLoading ? (
            <DisabledButton />
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-10 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 font-bold transition-all"
              onClick={updateSongData}
            >
              Update Song
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

export default EditSong;

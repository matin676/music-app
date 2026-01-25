import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import { motion } from "framer-motion";
import { BiCloudUpload } from "react-icons/bi";
import { MdDelete } from "react-icons/md";

import { storage } from "../../config/firebase.config";
import { useStateValue } from "../../context/StateProvider";
import { useData } from "../../hooks/useData";
import FilterButtons from "../Shared/FilterButtons";
import { saveNewAlbum, saveNewArtist, saveNewSong } from "../../api";
import { actionType } from "../../context/reducer";
import { filterByLanguage, filters } from "../../utils/supportfunctions";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";

//Disabled Button
export const DisabledButton = () => {
  return (
    <button
      disabled
      type="button"
      className="text-white bg-blue-400 cursor-not-allowed font-medium rounded-xl text-sm px-5 py-2.5 text-center inline-flex items-center shadow-none transition-all"
    >
      <svg
        aria-hidden="true"
        role="status"
        className="inline w-4 h-4 me-3 text-white animate-spin"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="#E5E7EB"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentColor"
        />
      </svg>
      Loading...
    </button>
  );
};

//Loader
export const FileLoader = ({ progress }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
      <p className="text-xl font-bold text-gray-700">
        {Math.round(progress) > 0 && <>{`${Math.round(progress)}%`}</>}
      </p>
      <div className="w-16 h-16 bg-blue-500 animate-ping rounded-full flex items-center justify-center opacity-75"></div>
    </div>
  );
};

//Uploader
export const FileUploader = ({
  setImageURL,
  setAlert,
  alertMsg,
  isLoading,
  isImage,
  setProgress,
}) => {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const uploadFile = (e) => {
    isLoading(true);
    const imageFile = e.target.files[0];
    const storageRef = ref(
      storage,
      `${isImage ? "Images" : "Audio"}/${Date.now()}-${imageFile.name}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },

      (error) => {
        setAlert("error");
        alertMsg("File upload failed.");
        timeoutRef.current = setTimeout(() => {
          setAlert(null);
        }, 4000);
        isLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setImageURL(downloadUrl);
          setProgress(0);
          isLoading(false);
          setAlert("success");
          alertMsg("File uploaded successfully");
          timeoutRef.current = setTimeout(() => {
            setAlert(null);
          }, 4000);
        });
      },
    );
  };

  return (
    <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 hover:text-headingColor transition-colors">
        <div className="text-4xl">
          <BiCloudUpload />
        </div>
        <p className="text-sm font-medium">
          Click to upload {isImage ? "an image" : "an audio"}
        </p>
      </div>
      <input
        type="file"
        name="upload-file"
        accept={`${isImage ? "image/*" : "audio/*"}`}
        className="w-0 h-0"
        onChange={uploadFile}
      />
    </label>
  );
};

//Main Component
export default function DashboardNewSong() {
  const { fetchArtists, fetchAlbums, refreshAllData } = useData();
  const navigate = useNavigate();
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [songImageUrl, setSongImageUrl] = useState(null);
  const [alert, setAlert] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [songName, setSongName] = useState("");
  const [audioAsset, setAudioAsset] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const audioRef = useRef();

  const [
    {
      allArtists,
      allAlbums,
      albumFilter,
      artistFilter,
      filterTerm,
      languageFilter,
    },
    dispatch,
  ] = useStateValue();

  useEffect(() => {
    fetchArtists();
    fetchAlbums();
  }, [fetchArtists, fetchAlbums]);

  const deleteImageObject = (songURL, action) => {
    if (action === "image") {
      setIsImageLoading(true);
      setSongImageUrl(null);
    } else {
      setIsAudioLoading(true);
      setAudioAsset(null);
    }
    const deleteRef = ref(storage, songURL);
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

  const saveSong = () => {
    if (!songImageUrl || !audioAsset || !songName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setIsImageLoading(true);
      setIsAudioLoading(true);
      const data = {
        name: songName,
        imageURL: songImageUrl,
        songURL: audioAsset,
        album: albumFilter,
        artist: artistFilter,
        language: languageFilter,
        category: filterTerm,
        isPublic: isPublic,
      };

      saveNewSong(data).then(() => {
        refreshAllData();
        navigate("/dashboard/songs");
      });

      setIsImageLoading(false);
      setIsAudioLoading(false);
      setSongName("");
      setSongImageUrl(null);
      setAudioAsset(null);
      dispatch({ type: actionType.SET_ARTIST_FILTER, artistFilter: null });
      dispatch({ type: actionType.SET_LANGUAGE_FILTER, languageFilter: null });
      dispatch({ type: actionType.SET_ALBUM_FILTER, albumFilter: null });
      dispatch({ type: actionType.SET_FILTER_TERM, filterTerm: null });
      setDuration(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="w-full flex flex-col gap-6 items-center justify-center rounded-3xl p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-xl">
        <p className="text-2xl font-bold text-headingColor self-start">
          Upload New Song
        </p>

        <input
          type="text"
          placeholder="Type your song name"
          className="w-full p-4 rounded-xl text-lg font-semibold text-headingColor outline-none shadow-sm border border-gray-200 bg-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        />

        <div className="w-full flex md:justify-between items-center gap-3 md:gap-4 relative z-20 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <FilterButtons
            filterData={allArtists}
            flag={"Artist"}
            multiple={true}
          />
          <FilterButtons filterData={allAlbums} flag={"Albums"} />
          <FilterButtons filterData={filterByLanguage} flag={"Language"} />
          <div className="flex items-center gap-4">
            <FilterButtons
              filterData={filters}
              flag={"Category"}
              multiple={true}
            />
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white">
              <input
                type="checkbox"
                id="isPublic"
                className="w-5 h-5 cursor-pointer accent-blue-600"
                checked={isPublic} // We need to add this state
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <label
                htmlFor="isPublic"
                className="text-sm font-semibold text-headingColor cursor-pointer"
              >
                Public
              </label>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Uploader */}
          <div className="bg-white/50 backdrop-blur-sm w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/70 transition-all cursor-pointer relative overflow-hidden group">
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
          <div className="bg-white/50 backdrop-blur-sm w-full h-64 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/70 transition-all cursor-pointer relative overflow-hidden group">
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
                    <audio
                      ref={audioRef}
                      src={audioAsset}
                      controls
                      className="w-[90%] z-10"
                    />
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
              onClick={saveSong}
            >
              Upload Song
            </motion.button>
          )}
        </div>
      </div>

      {/* Add Artist & Album Sections */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <AddNewArtist />
        <AddNewAlbum />
      </div>

      {alert && (
        <>
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </>
      )}
    </div>
  );
}

//Add new artist component
export const AddNewArtist = () => {
  const [isArtist, setIsArtist] = useState(false);
  const [artistProgress, setArtistProgress] = useState(0);

  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [artistCoverImage, setArtistCoverImage] = useState(null);

  const [artistName, setArtistName] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");

  const { refreshAllData } = useData();
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const deleteImageObject = (songURL) => {
    setIsArtist(true);
    setArtistCoverImage(null);
    const deleteRef = ref(storage, songURL);
    deleteObject(deleteRef).then(() => {
      setAlert("success");
      setAlertMsg("File removed successfully");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsArtist(false);
    });
  };

  const saveArtist = () => {
    if (!artistCoverImage || !artistName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setIsArtist(true);
      const data = {
        name: artistName,
        imageURL: artistCoverImage,
        twitter: twitter,
        instagram: instagram,
      };
      saveNewArtist(data).then(() => {
        refreshAllData();
      });
      setIsArtist(false);
      setArtistCoverImage(null);
      setArtistName("");
      setTwitter("");
      setInstagram("");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl w-full">
      <p className="text-xl font-bold text-headingColor">Add New Artist</p>

      <div className="flex flex-col gap-4">
        {/* Image Uploader */}
        <div className="bg-white/50 backdrop-blur-sm w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/70 transition-all cursor-pointer relative overflow-hidden">
          {isArtist && <FileLoader progress={artistProgress} />}
          {!isArtist && (
            <>
              {!artistCoverImage ? (
                <FileUploader
                  setImageURL={setArtistCoverImage}
                  setAlert={setAlert}
                  alertMsg={setAlertMsg}
                  isLoading={setIsArtist}
                  setProgress={setArtistProgress}
                  isImage={true}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={artistCoverImage}
                    alt="uploaded pic"
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-red-500 text-lg cursor-pointer outline-none hover:shadow-md transition-all text-white"
                    onClick={() => {
                      deleteImageObject(artistCoverImage);
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
          placeholder="Artist Name"
          className="w-full p-3 rounded-lg text-sm font-semibold text-headingColor outline-none shadow-sm border border-gray-200 bg-white placeholder-gray-400 focus:border-blue-400 transition-all"
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <div className="w-full p-3 flex items-center rounded-lg shadow-sm border border-gray-200 bg-white">
            <p className="text-sm font-semibold text-gray-400 whitespace-nowrap mr-2">
              x.com/
            </p>
            <input
              type="text"
              placeholder="username"
              className="w-full text-sm font-semibold text-headingColor outline-none bg-transparent placeholder-gray-300"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
            />
          </div>
          <div className="w-full p-3 flex items-center rounded-lg shadow-sm border border-gray-200 bg-white">
            <p className="text-sm font-semibold text-gray-400 whitespace-nowrap mr-2">
              instagram.com/
            </p>
            <input
              type="text"
              placeholder="username"
              className="w-full text-sm font-semibold text-headingColor outline-none bg-transparent placeholder-gray-300"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-2">
          {isArtist ? (
            <DisabledButton />
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all text-sm font-bold"
              onClick={saveArtist}
            >
              Save Artist
            </motion.button>
          )}
        </div>
      </div>

      {alert && (
        <>
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </>
      )}
    </div>
  );
};

//Add new album component
export const AddNewAlbum = () => {
  const [isAlbum, setIsAlbum] = useState(false);
  const [albumProgress, setAlbumProgress] = useState(0);

  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [albumCoverImage, setAlbumCoverImage] = useState(null);

  const [albumName, setAlbumName] = useState("");

  const { refreshAllData } = useData();
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const deleteImageObject = (songURL) => {
    setIsAlbum(true);
    setAlbumCoverImage(null);
    const deleteRef = ref(storage, songURL);
    deleteObject(deleteRef).then(() => {
      setAlert("success");
      setAlertMsg("File removed successfully");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsAlbum(false);
    });
  };

  const saveAlbum = () => {
    if (!albumCoverImage || !albumName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      timeoutRef.current = setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setIsAlbum(true);
      const data = {
        name: albumName,
        imageURL: albumCoverImage,
      };
      saveNewAlbum(data).then(() => {
        refreshAllData();
      });
      setIsAlbum(false);
      setAlbumCoverImage(null);
      setAlbumName("");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl w-full">
      <p className="text-xl font-bold text-headingColor">Add New Album</p>

      <div className="flex flex-col gap-4">
        {/* Image Uploader */}
        <div className="bg-white/50 backdrop-blur-sm w-full h-48 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/70 transition-all cursor-pointer relative overflow-hidden">
          {isAlbum && <FileLoader progress={albumProgress} />}
          {!isAlbum && (
            <>
              {!albumCoverImage ? (
                <FileUploader
                  setImageURL={setAlbumCoverImage}
                  setAlert={setAlert}
                  alertMsg={setAlertMsg}
                  isLoading={setIsAlbum}
                  setProgress={setAlbumProgress}
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
          className="w-full p-3 rounded-lg text-sm font-semibold text-headingColor outline-none shadow-sm border border-gray-200 bg-white placeholder-gray-400 focus:border-blue-400 transition-all"
          value={albumName}
          onChange={(e) => setAlbumName(e.target.value)}
        />

        <div className="flex justify-end mt-2">
          {isAlbum ? (
            <DisabledButton />
          ) : (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all text-sm font-bold"
              onClick={saveAlbum}
            >
              Save Album
            </motion.button>
          )}
        </div>
      </div>

      {alert && (
        <>
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </>
      )}
    </div>
  );
};

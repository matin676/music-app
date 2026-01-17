import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDelete,
  MdPlaylistAdd,
  MdPlaylistAddCheck,
  MdCloudUpload,
} from "react-icons/md";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import Header from "../Shared/Header";
import { storage } from "../../config/firebase.config";
import SearchBar from "../Shared/SearchBar";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import { getAllPlaylist, getAllSongs, savePlaylist } from "../../api";
import { FileLoader } from "../Dashboard/DashboardNewSong";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";
import SEO from "../Shared/SEO";

export function FileUploader({
  setImageURL,
  setAlert,
  alertMsg,
  isLoading,
  setProgress,
}) {
  const uploadFile = (e) => {
    isLoading(true);
    const imageFile = e.target.files[0];
    const storageRef = ref(storage, `Playlist/${Date.now()}-${imageFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        setAlert("error");
        alertMsg("File upload failed.");
        setTimeout(() => {
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
          setTimeout(() => {
            setAlert(null);
          }, 4000);
        });
      }
    );
  };

  return (
    <label className="flex flex-col items-center justify-center h-full w-full cursor-pointer hover:bg-gray-100/10 transition-colors rounded-xl group relative">
      <div className="flex flex-col justify-center items-center">
        <MdCloudUpload className="text-4xl text-gray-500 group-hover:text-blue-500 transition-colors" />
        <p className="text-sm font-medium text-gray-400 group-hover:text-gray-200 mt-2">
          Click to upload cover
        </p>
      </div>
      <input
        type="file"
        name="upload-file"
        accept="image/*"
        className="hidden"
        onChange={uploadFile}
      />
    </label>
  );
}

export function SongContainer({ musics, handleAddToPlaylist, selectedSongs }) {
  const [{ isSongPlaying, songIndex }, dispatch] = useStateValue();

  const addSongToContext = (index) => {
    if (!isSongPlaying) {
      dispatch({ type: actionType.SET_ISSONG_PLAYING, isSongPlaying: true });
    }
    if (songIndex !== index) {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: index });
    }
  };

  return (
    <>
      {musics?.map((data, index) => (
        <div
          key={data._id}
          className={`relative w-full p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
            selectedSongs.includes(data._id)
              ? "bg-blue-500/10 border border-blue-500/30 shadow-md"
              : "bg-white/30 border border-white/20 hover:bg-white/50"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            addSongToContext(index);
          }}
        >
          <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
            <img
              src={data.imageURL}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col grow min-w-0">
            <p className="text-headingColor font-semibold truncate">
              {data.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{data.artist}</p>
          </div>

          <button
            className={`p-2 rounded-full transition-colors ${
              selectedSongs.includes(data._id)
                ? "bg-blue-500 text-white shadow-blue-500/30 shadow-md"
                : "bg-gray-200 text-gray-500 hover:bg-blue-500 hover:text-white"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToPlaylist(data._id);
            }}
          >
            {selectedSongs.includes(data._id) ? (
              <MdPlaylistAddCheck className="text-xl" />
            ) : (
              <MdPlaylistAdd className="text-xl" />
            )}
          </button>
        </div>
      ))}
    </>
  );
}

export default function AddNewPlaylist() {
  const [{ allSongs, searchTerm, user }, dispatch] = useStateValue();
  const navigate = useNavigate();

  const [playlistName, setPlaylistName] = useState("");
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState(null);

  const [isPlaylist, setIsPlaylist] = useState(false);
  const [playlistProgress, setPlaylistProgress] = useState(0);

  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);
  const [playlistCoverImage, setPlaylistCoverImage] = useState(null);

  const handleAddToPlaylist = (songId) => {
    setSelectedSongs((prevSongs) =>
      prevSongs.includes(songId)
        ? prevSongs.filter((id) => id !== songId)
        : [...prevSongs, songId]
    );
  };

  const deleteImageObject = (songURL) => {
    setIsPlaylist(true);
    setPlaylistCoverImage(null);
    const deleteRef = ref(storage, songURL);
    deleteObject(deleteRef).then(() => {
      setAlert("success");
      setAlertMsg("File removed successfully");
      setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsPlaylist(false);
    });
  };

  const handleSavePlaylist = () => {
    if (!playlistCoverImage || !playlistName) {
      setAlert("error");
      setAlertMsg("Required fields are missing");
      setTimeout(() => {
        setAlert(null);
      }, 4000);
    } else {
      setAlert("success");
      setAlertMsg("Playlist created");
      setTimeout(() => {
        setAlert(null);
      }, 4000);
      setIsPlaylist(true);
      const data = {
        name: playlistName,
        imageURL: playlistCoverImage,
        songs: selectedSongs,
        user: user?.user?._id,
      };
      savePlaylist(data).then((res) => {
        getAllPlaylist().then((playlistData) => {
          dispatch({
            type: actionType.SET_ALL_PLAYLISTS,
            playlist: playlistData.data,
          });
          navigate("/library", { replace: true });
        });
      });
      setIsPlaylist(false);
      setPlaylistCoverImage(null);
      setPlaylistName("");
      setSelectedSongs([]);
    }
  };

  useEffect(() => {
    setFilteredSongs(null);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0 && allSongs) {
      const filtered = allSongs.filter(
        (data) =>
          (data.artist &&
            data.artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (data.name &&
            data.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [searchTerm, allSongs]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-transparent">
      <SEO
        title="Create New Playlist"
        description="Tailor your music experience by creating a new custom playlist on MusicApp"
      />
      <Header />

      <main className="w-full max-w-6xl p-6 flex flex-col gap-8">
        <h2 className="text-3xl font-bold text-headingColor">
          Create New Playlist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/20 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative w-full aspect-square max-w-[300px] bg-white/10 border-2 border-dashed border-white/30 rounded-2xl overflow-hidden flex items-center justify-center">
              {isPlaylist ? (
                <FileLoader progress={playlistProgress} />
              ) : !playlistCoverImage ? (
                <FileUploader
                  setImageURL={setPlaylistCoverImage}
                  setAlert={setAlert}
                  alertMsg={setAlertMsg}
                  isLoading={setIsPlaylist}
                  setProgress={setPlaylistProgress}
                />
              ) : (
                <div className="relative w-full h-full group">
                  <img
                    src={playlistCoverImage}
                    alt="Playlist Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
                      onClick={() => deleteImageObject(playlistCoverImage)}
                    >
                      <MdDelete className="text-2xl" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-headingColor font-semibold ml-1">
                Playlist Name
              </label>
              <input
                type="text"
                placeholder="My Awesome Playlist"
                className="w-full p-4 rounded-xl bg-white/40 border border-white/30 outline-none text-headingColor placeholder-gray-500 font-medium focus:bg-white/60 focus:border-blue-500 transition-all"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between bg-white/30 p-4 rounded-xl">
              <span className="text-headingColor font-medium">
                Selected Songs
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {selectedSongs.length}
              </span>
            </div>

            <button
              type="button"
              className="w-full py-4 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 shadow-lg hover:shadow-blue-500/30 transition-all transform active:scale-95"
              onClick={handleSavePlaylist}
            >
              Create Playlist
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="text-2xl font-semibold text-headingColor">
            Add Songs
          </h3>
          <SearchBar />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SongContainer
              musics={filteredSongs ? filteredSongs : allSongs}
              handleAddToPlaylist={handleAddToPlaylist}
              selectedSongs={selectedSongs}
            />
          </div>
        </div>
      </main>

      {alert && (
        <div className="fixed top-20 right-4 z-50">
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { MdDelete, MdPlaylistAdd, MdPlaylistAddCheck } from "react-icons/md";
import { BiCloudUpload } from "react-icons/bi";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";

import Header from "./Header";
import { storage } from "../config/firebase.config";
import SearchBar from "./SearchBar";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { getAllPlaylist, getAllSongs, savePlaylist } from "../api";
import { FileLoader } from "./DashboardNewSong";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";

export const FileUploader = ({
  setImageURL,
  setAlert,
  alertMsg,
  isLoading,
  isImage,
  setProgress,
}) => {
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
    <label>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col justify-center items-center cursor-pointer">
          <p className="font-bold text-2xl">
            <BiCloudUpload />
          </p>
          <p className="text-lg">Click to upload an image</p>
        </div>
      </div>
      <input
        type="file"
        name="upload-file"
        accept="image/*"
        className="w-0 h-0"
        onChange={uploadFile}
      />
    </label>
  );
};

export default function AddNewPlaylist() {
  const [{ allSongs, searchTerm, playlist }, dispatch] = useStateValue();

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
      };
      savePlaylist(data).then((res) => {
        getAllPlaylist().then((playlistData) => {
          dispatch({
            type: actionType.SET_ALL_PLAYLISTS,
            playlistData: playlistData.playlist,
          });
        });
      });
      setIsPlaylist(false);
      setPlaylistCoverImage(null);
      setPlaylistName("");
    }
  };

  useEffect(() => {
    if (!allSongs) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.song,
        });
      });
    }
    setFilteredSongs(null);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allSongs.filter(
        (data) =>
          data.artist.toLowerCase().includes(searchTerm) ||
          data.name.toLowerCase().includes(searchTerm)
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [searchTerm, allSongs]);

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center bg-primary">
      <Header />
      <h1 className="text-2xl font-semibold mb-4">AddNewPlayList</h1>
      <div className="flex items-center justify-center gap-4">
        <div className="bg-card  backdrop-blur-md w-full lg:w-300 h-300 rounded-md border-2 border-dotted border-gray-300 cursor-pointer">
          {isPlaylist && <FileLoader progress={playlistProgress} />}
          {!isPlaylist && (
            <>
              {!playlistCoverImage ? (
                <FileUploader
                  setImageURL={setPlaylistCoverImage}
                  setAlert={setAlert}
                  alertMsg={setAlertMsg}
                  isLoading={setIsPlaylist}
                  setProgress={setPlaylistProgress}
                  isImage={true}
                />
              ) : (
                <div className="relative w-full h-full overflow-hidden rounded-md">
                  <img
                    src={playlistCoverImage}
                    alt="uploaded pic"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md  duration-500 transition-all ease-in-out"
                  >
                    <MdDelete
                      className="text-white"
                      onClick={() => {
                        deleteImageObject(playlistCoverImage);
                      }}
                    />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <div>
          <input
            type="text"
            placeholder="Type your playlist name"
            className="p-3 rounded-md text-base font-semibold text-textColor outline-none shadow-sm border border-gray-300 bg-transparent w-80"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
          <p className="my-3 text-textColor font-medium">
            Songs added to playlist:{" "}
            <span className="text-2xl">{selectedSongs.length}</span>
          </p>
          <button
            type="button"
            className="my-3 p-3 rounded-full bg-red-500 text-xl cursor-pointer outline-none hover:shadow-md  duration-500 transition-all ease-in-out"
            onClick={handleSavePlaylist}
          >
            Save Playlist
          </button>
        </div>
      </div>
      <SearchBar />

      <div className="w-full h-auto flex items-center justify-evenly gap-4 flex-wrap p-4">
        <SongContainer
          musics={filteredSongs ? filteredSongs : allSongs}
          handleAddToPlaylist={handleAddToPlaylist}
          selectedSongs={selectedSongs}
        />
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

export const SongContainer = ({
  musics,
  handleAddToPlaylist,
  selectedSongs,
}) => {
  const [{ isSongPlaying, songIndex }, dispatch] = useStateValue();

  const addSongToContext = (index) => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }
    if (songIndex !== index) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: index,
      });
    }
  };

  return (
    <>
      {musics?.map((data, index) => (
        <div
          key={data._id}
          className="relative w-full px-2 py-4 cursor-pointer hover:shadow-xl hover:bg-card bg-gray-100 shadow-md rounded-lg flex items-center"
          onClick={(e) => {
            e.stopPropagation();
            addSongToContext(index);
          }}
        >
          <div className="w-10 h-10 rounded-full drop-shadow-lg relative overflow-hidden">
            <img
              src={data.imageURL}
              alt=""
              className="w-full h-full rounded-lg object-cover"
            />
          </div>

          <p className="text-base text-headingColor font-semibold mx-8 flex flex-col">
            {data.name}
            <span className="text-sm text-gray-400 mx-1">{data.artist}</span>
          </p>
          <div className="flex items-center justify-between px-10 absolute right-0">
            {selectedSongs.includes(data._id) ? (
              <i
                className="text-2xl text-red-400 drop-shadow-md hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToPlaylist(data._id);
                }}
              >
                <MdPlaylistAddCheck />
              </i>
            ) : (
              <i
                className="text-2xl text-red-400 drop-shadow-md hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToPlaylist(data._id);
                }}
              >
                <MdPlaylistAdd />
              </i>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

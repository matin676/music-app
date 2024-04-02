import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { MdPlayCircle, MdPauseCircle } from "react-icons/md";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { getAllSongs, getPlaylistById } from "../api";
import { actionType } from "../context/reducer";

export default function PlaylistSongs() {
  const [{ selectedPlaylist, allSongs, songIndex, isSongPlaying }, dispatch] =
    useStateValue();

  const { id } = useParams();

  const createdAt = selectedPlaylist
    ? moment(new Date(selectedPlaylist.createdAt)).format("MMMM  Do YYYY")
    : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlaylistById(id);
        // console.log("Fetched data:", data);
        if (data && data.success) {
          dispatch({
            type: actionType.SET_SELECTED_PLAYLIST,
            selectedPlaylist: data.playlist,
          });
          // console.log("Selected Playlist:", data.playlist);
        } else {
          console.error("Error fetching playlist:", data.msg);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error("Playlist not found.");
        } else {
          console.error("Error fetching playlists:", error);
        }
      }
    };

    if (!selectedPlaylist || selectedPlaylist._id !== id) {
      fetchData();
    }
  }, [id, selectedPlaylist, dispatch]);

  useEffect(() => {
    if (!allSongs) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.song,
        });
      });
    }
  }, []);

  const selectedSongs =
    selectedPlaylist && selectedPlaylist.songs && allSongs
      ? allSongs.filter((song) => selectedPlaylist.songs.includes(song._id))
      : [];

  const handlePlaySong = (index) => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }
    const clickedSong = selectedSongs[index];
    const songIndex = allSongs.findIndex(
      (song) => song._id === clickedSong._id
    );
    if (songIndex !== index) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: songIndex,
      });
    }
  };

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center bg-primary">
      <Header />
      {selectedPlaylist && (
        <div className="flex flex-col">
          <div className="flex">
            <img
              src={selectedPlaylist.imageURL}
              alt={selectedPlaylist.name}
              className="w-80 h-auto object-cover rounded-md"
            />
            <div className="flex flex-col mx-10 my-10">
              <p className="text-2xl font-semibold mb-4">
                {selectedPlaylist.name}
              </p>
              <p className="text-base text-darkOverlay font-semibold mb-4">
                Songs:{" "}
                {selectedPlaylist.songs ? selectedPlaylist.songs.length : 0}
              </p>
              <i>
                {isSongPlaying ? (
                  <MdPauseCircle
                    className="text-3xl text-red-500 hover:cursor-pointer hover:scale-[1.2] transition-all ease-in-out"
                    onClick={() => handlePlaySong(songIndex)}
                  />
                ) : (
                  <MdPlayCircle
                    className="text-3xl text-red-500 hover:cursor-pointer hover:scale-[1.2] transition-all ease-in-out"
                    onClick={() => handlePlaySong(0)}
                  />
                )}
              </i>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 flex items-center justify-center flex-col">
        <div className="relative py-12 min-h-[400px] overflow-x-scroll my-4 flex flex-col items-center justify-start p-4 border border-gray-300 rounded-md gap-3">
          <div className="w-full min-w-[750px] flex items-center justify-between">
            <p className="text-sm text-textColor font-semibold w-275 min-w-[160px] text-center">
              #
            </p>
            <p className="text-sm text-textColor font-semibold w-275 min-w-[160px] text-center">
              Image
            </p>
            <p className="text-sm text-textColor font-semibold w-275 min-w-[160px] text-center">
              Title
            </p>
            <p className="text-sm text-textColor font-semibold w-275 min-w-[160px] text-center">
              Album
            </p>
            <p className="text-sm text-textColor font-semibold w-275 min-w-[160px] text-center">
              Date added
            </p>
          </div>
          {selectedPlaylist &&
            selectedPlaylist.songs &&
            selectedPlaylist.songs.length > 0 && (
              <>
                {selectedSongs.map((song, index) => (
                  <div
                    key={index}
                    className="relative w-full rounded-md flex items-center justify-between py-4 bg-lightOverlay cursor-pointer hover:bg-card hover:shadow-md"
                    onClick={() => handlePlaySong(index)}
                  >
                    <p className="text-base text-textColor w-275 min-w-[160px] text-center">
                      {index + 1}
                    </p>
                    <div className="w-275 min-w-[160px] flex items-center justify-center">
                      <img
                        src={song.imageURL}
                        alt={song.name}
                        className="w-10 h-10 object-cover rounded-md min-w-[40px] shadow-md"
                      />
                    </div>
                    <p className="text-base text-textColor w-275 min-w-[160px] text-center">
                      {song.name}
                    </p>
                    <p className="text-base text-textColor w-275 min-w-[160px] text-center">
                      {song.album}
                    </p>
                    <p className="text-base text-textColor w-275 min-w-[160px] text-center">
                      {createdAt}
                    </p>
                  </div>
                ))}
              </>
            )}
        </div>
      </div>
    </div>
  );
}

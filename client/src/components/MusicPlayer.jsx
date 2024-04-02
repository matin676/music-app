import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RiPlayListFill } from "react-icons/ri";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

import { useStateValue } from "../context/StateProvider";
import { getAllSongs } from "../api";
import { actionType } from "../context/reducer";
import { IoArrowRedo, IoClose, IoMusicalNote } from "react-icons/io5";

export default function MusicPlayer() {
  const [{ allSongs, songIndex, isSongPlaying, miniPlayer }, dispatch] =
    useStateValue();

  const [isPlayList, setIsPlaylist] = useState(false);

  const nextTrack = () => {
    if (songIndex > allSongs.length - 2) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: 0,
      });
    } else {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: songIndex + 1,
      });
    }
  };

  const previousTrack = () => {
    if (songIndex === 0) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: 0,
      });
    } else {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: songIndex - 1,
      });
    }
  };

  const closePlayer = () => {
    dispatch({
      type: actionType.SET_ISSONG_PLAYING,
      isSongPlaying: false,
    });
  };

  const togglePlayer = () => {
    if (miniPlayer) {
      dispatch({
        type: actionType.SET_MINI_PLAYER,
        miniPlayer: false,
      });
    } else {
      dispatch({
        type: actionType.SET_MINI_PLAYER,
        miniPlayer: true,
      });
    }
  };

  return (
    <div className="w-full flex items-center gap-3">
      <div
        className={`w-full items-center gap-3 p-4 ${
          miniPlayer ? "absolute top-40" : "flex relative"
        }`}
      >
        <img
          src={allSongs[songIndex]?.imageURL}
          alt=""
          className="w-40 h-20 object-cover rounded-md"
        />
        <div className="flex items-start flex-col">
          <p className="text-xl text-headingColor font-semibold">
            {`${
              allSongs[songIndex]?.name.length > 20
                ? allSongs[songIndex]?.name.slice(0, 20)
                : allSongs[songIndex]?.name
            }`}
            <span className="text-base">({allSongs[songIndex]?.album})</span>
          </p>
          <p className="text-textColor">
            {allSongs[songIndex]?.artist}
            <span className="text-sm text-textColor font-semibold">
              ({allSongs[songIndex]?.category})
            </span>
          </p>
          <motion.i
            whileTap={{ scale: 0.8 }}
            onClick={() => setIsPlaylist(!isPlayList)}
          >
            <RiPlayListFill className="text-textColor hover:text-headingColor text-3xl cursor-pointer" />
          </motion.i>
        </div>

        <div className="flex-1">
          <AudioPlayer
            src={allSongs[songIndex]?.songURL}
            autoPlay={true}
            showSkipControls={true}
            onPlay={() => console.log("is playing")}
            onClickNext={nextTrack}
            onClickPrevious={previousTrack}
            onEnded={nextTrack}
          />
        </div>

        <div className="h-full flex items-center justify-center flex-col gap-3">
          <motion.i whileTap={{ scale: 0.8 }} onClick={closePlayer}>
            <IoClose
              onClick={closePlayer}
              className="text-textColor cursor-pointer text-2xl hover:text-headingColor"
            />
          </motion.i>
          <motion.i whileTap={{ scale: 0.8 }} onClick={togglePlayer}>
            <IoArrowRedo
              onClick={togglePlayer}
              className="text-textColor cursor-pointer text-2xl hover:text-headingColor"
            />
          </motion.i>
        </div>

        {isPlayList && (
          <>
            <PlayListCard />
          </>
        )}

        {miniPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 0.6 }}
            className="fixed right-2 bottom-2"
          >
            <div className="w-40 h-40 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-red-600 blur-xl animate-pulse"></div>
              <img
                onClick={togglePlayer}
                src={allSongs[songIndex]?.imageURL}
                alt=""
                className="z-50 w-32 h-32 rounded-full object-cover cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export const PlayListCard = () => {
  const [{ allSongs, songIndex, isSongPlaying }, dispatch] = useStateValue();
  const [randomSongs, setRandomSongs] = useState([]);

  useEffect(() => {
    const lastUpdated = window.localStorage.getItem("playlist_last_updated");
    const currentDate = new Date().toLocaleDateString();

    if (!lastUpdated || lastUpdated !== currentDate) {
      if (!allSongs) {
        getAllSongs().then((data) => {
          dispatch({
            type: actionType.SET_ALL_SONGS,
            allSongs: data.song,
          });
          updatePlayList(currentDate, data.song);
        });
      } else {
        updatePlayList(currentDate, allSongs);
      }
    } else {
      const cachedSongs = JSON.parse(
        window.localStorage.getItem("random_songs")
      );
      if (cachedSongs) {
        setRandomSongs(cachedSongs);
      }
    }
  }, [allSongs]);

  const updatePlayList = (date, songs) => {
    window.localStorage.setItem("playlist_last_updated", date);
    const selectedSongs =
      songs.length > 15 ? getRandomSubset(songs, 15) : songs;
    window.localStorage.setItem("random_songs", JSON.stringify(selectedSongs));
    setRandomSongs(selectedSongs);
  };

  const getRandomSubset = (array, size) => {
    const shuffledArray = [...array].sort(() => Math.random() - 0.5);
    return shuffledArray.slice(0, size);
  };

  const handleSongClick = (index) => {
    const clickedSong = randomSongs[index];
    const songIndex = allSongs.findIndex(
      (song) => song._id === clickedSong._id
    );

    if (songIndex !== -1) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: songIndex,
      });
    }
  };

  return (
    <div className="absolute left-4 bottom-24 gap-2 py-2 w-350 max-w-[350px] h-510 max-h-[510px] flex flex-col overflow-y-scroll scrollbar-thin rounded-md shadow-md bg-primary">
      <p className="flex items-center justify-center py-2 font-medium text-2xl">
        Today's Top 15
      </p>
      {randomSongs.length > 0 ? (
        randomSongs.map((music, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group w-full p-4 hover:bg-card flex gap-3 items-center cursor-pointer bg-transparent"
            onClick={() => handleSongClick(index)}
          >
            <IoMusicalNote className="text-textColor group-hover:text-headingColor text-2xl cursor-pointer" />
            <div className="flex items-start flex-col">
              <p className="text-xl text-headingColor font-semibold">
                {`${
                  music?.name.length > 20
                    ? music?.name.slice(0, 20)
                    : music?.name
                }`}
                <span className="text-base">({music?.album})</span>
              </p>
              <p className="text-textColor">
                {music?.artist}
                <span className="text-sm text-textColor font-semibold">
                  ({music?.category})
                </span>
              </p>
            </div>
          </motion.div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
};

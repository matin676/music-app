import React, { useEffect, useState, useRef } from "react";
import { useStateValue } from "../context/StateProvider";
import { IoMdClose } from "react-icons/io";
import {
  IoArrowRedo,
  IoArrowUndo,
  IoMusicalNote,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { actionType } from "../context/reducer";
import { RiPlayListFill } from "react-icons/ri";

export default function MusicPlayer() {
  const [isPlayList, setIsPlayList] = useState(false);
  const [
    { allSongs, songIndex, isSongPlaying, miniPlayer, currentPlaylist },
    dispatch,
  ] = useStateValue();

  // Use currentPlaylist if set, otherwise use allSongs
  const activeSongs = currentPlaylist || allSongs;

  const closePlayer = () => {
    dispatch({
      type: actionType.SET_ISSONG_PLAYING,
      isSongPlaying: false,
    });
  };

  const togglePlayerMode = () => {
    dispatch({
      type: actionType.SET_MINI_PLAYER,
      miniPlayer: !miniPlayer,
    });
  };

  const nextTrack = () => {
    if (!activeSongs) return;
    if (songIndex >= activeSongs.length - 1) {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: 0 });
    } else {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: songIndex + 1 });
    }
  };

  const previousTrack = () => {
    if (songIndex === 0) {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: 0 });
    } else {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: songIndex - 1 });
    }
  };

  useEffect(() => {
    if (activeSongs && songIndex > activeSongs.length) {
      dispatch({ type: actionType.SET_SONG_INDEX, songIndex: 0 });
    }
  }, [songIndex, activeSongs]);

  return (
    <div className="fixed bottom-0 w-full z-[100] flex flex-col pointer-events-none">
      {/* 
        AUDIO PLAYER LOGIC - Always Mounted, Hidden 
        It controls the audio state. We position it hiddenly or integrate it into the UI.
        To avoid two instances, we render it ONCE here, but we need its UI controls in the Full Player.
        
        Refactoring Strategy:
        The 'react-h5-audio-player' comes with its own UI. 
        If we want to keep it playing while minimized, we must keep it mounted.
        If we hide it with display:none, the user can't click its specific controls.
        
        So we have two choices:
        1. Custom controls that talk to a hidden ref-based audio element (Best but hardworking).
        2. CSS: When 'mini', hide the wrapper but keep the component mounted? No, that hides controls.
        
        Compromise:
        We will render the AudioPlayer inside the Full Player container.
        When minimized, we HIDE the Full Player container using CSS 'visibility: hidden' or 'opacity: 0' + 'pointer-events: none', 
        BUT we keep it in the DOM so the audio plays.
        However, the user wants a Mini Player Circle.
        
        Let's try: 
        - Full Player Layer: Fixed bottom, z-100.
        - Mini Player Layer: Fixed bottom-right, z-101.
        
        If Mini Mode is ON:
        - Full Player Layer: opacity: 0, pointer-events: none (Audio keeps playing!)
        - Mini Player Layer: visible
       */}

      <motion.div
        initial={false}
        animate={miniPlayer ? { y: "100%", opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`w-full flex flex-col md:flex-row items-center gap-3 md:gap-8 ${
          miniPlayer
            ? "fixed -bottom-[100vh] left-0 pointer-events-none"
            : "p-3 md:p-4 bg-white/60 backdrop-blur-2xl border-t border-white/40 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] pointer-events-auto"
        }`}
        onAnimationComplete={() => {
          // Optional cleanup if needed
        }}
      >
        {/* Song Details */}
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-[30%] min-w-0">
          <div className="relative group shrink-0">
            <img
              src={activeSongs?.[songIndex]?.imageURL}
              className="w-14 h-14 md:w-16 md:h-16 rounded-lg md:rounded-xl object-cover shadow-lg border border-white/50"
              alt={activeSongs?.[songIndex]?.name || "Current Track"}
              referrerPolicy="no-referrer"
            />
            <div
              className="absolute inset-0 bg-black/30 rounded-lg md:rounded-xl opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={togglePlayerMode}
            >
              <IoChevronDown className="text-white text-lg md:text-xl" />
            </div>
          </div>

          <div className="flex flex-col min-w-0 overflow-hidden">
            <p className="text-sm md:text-lg font-bold text-headingColor truncate">
              {activeSongs?.[songIndex]?.name}
            </p>
            <p className="text-xs md:text-sm text-gray-500 truncate font-medium">
              {activeSongs?.[songIndex]?.artist}{" "}
              <span className="text-[10px] md:text-xs opacity-70">
                ({activeSongs?.[songIndex]?.album})
              </span>
            </p>
          </div>
        </div>

        {/* Player Controls - This is the actual player instance */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <AudioPlayer
            src={activeSongs?.[songIndex]?.songURL}
            autoPlay={true}
            showSkipControls={true}
            onClickNext={nextTrack}
            onClickPrevious={previousTrack}
            onEnded={nextTrack}
            className="!bg-transparent !shadow-none !border-none custom-audio-player !p-0"
            customAdditionalControls={[]}
            // customVolumeControls={[]}
          />
        </div>

        {/* Extra Controls */}
        <div className="flex items-center gap-3 md:gap-6 justify-end w-full md:w-[20%]">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlayList(!isPlayList)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <RiPlayListFill className="text-xl md:text-2xl text-gray-600" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={togglePlayerMode}
            className="p-2 hover:bg-black/5 rounded-full transition-colors hidden md:block"
          >
            <IoChevronDown className="text-xl md:text-2xl text-gray-600" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={closePlayer}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <IoMdClose className="text-xl md:text-2xl text-red-500" />
          </motion.button>
        </div>

        {/* Playlist Popup - Inside strict logical check */}
        <AnimatePresence>
          {isPlayList && !miniPlayer && (
            <PlayListCard
              activeSongs={activeSongs}
              songIndex={songIndex}
              onClose={() => setIsPlayList(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mini Player Floating Button - Outside the hidden container */}
      <AnimatePresence>
        {miniPlayer && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 50 }}
            className="fixed right-4 md:right-6 bottom-4 md:bottom-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/80 backdrop-blur-xl border-2 border-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden z-[120] pointer-events-auto"
            onClick={togglePlayerMode}
          >
            <img
              src={activeSongs?.[songIndex]?.imageURL}
              className="w-full h-full object-cover opacity-90 animate-[spin_8s_linear_infinite]"
              alt={activeSongs?.[songIndex]?.name || "Mini Player"}
            />
            {/* Center overlay */}
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center">
                <IoMusicalNote className="text-black/70 text-sm" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const PlayListCard = ({ activeSongs, songIndex, onClose }) => {
  const dispatch = useStateValue()[1];
  const listRef = useRef(null);

  // Auto-scroll to active song when card opens
  useEffect(() => {
    if (listRef.current) {
      const activeItem = listRef.current.querySelector(".active-track");
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  const playSong = (index) => {
    dispatch({ type: actionType.SET_SONG_INDEX, songIndex: index });
    dispatch({ type: actionType.SET_ISSONG_PLAYING, isSongPlaying: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      className="absolute bottom-[calc(100%+16px)] right-0 md:right-4 w-[90vw] md:w-96 max-h-[60vh] bg-white/95 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col z-[101]"
    >
      <div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/50">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg text-headingColor">Queue</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {activeSongs?.length} songs
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
        >
          <IoMdClose className="text-xl" />
        </button>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
      >
        {activeSongs?.map((song, i) => (
          <div
            key={song._id + i}
            className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-black/5 transition-all group ${
              songIndex === i ? "bg-blue-600/10 active-track shadow-sm" : ""
            }`}
            onClick={() => playSong(i)}
          >
            {/* Visual indicator for current track */}
            <div className="relative w-10 h-10 shrink-0">
              <img
                src={song.imageURL}
                className={`w-full h-full rounded-lg object-cover bg-gray-200 ${
                  songIndex === i ? "brightness-75" : ""
                }`}
                alt={song.name}
              />
              {songIndex === i && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex gap-0.5 items-end h-3">
                    <div className="w-0.5 bg-blue-500 animate-[music-bar_0.6s_ease-in-out_infinite]" />
                    <div className="w-0.5 bg-blue-500 animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
                    <div className="w-0.5 bg-blue-500 animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <p
                className={`text-sm truncate font-bold ${
                  songIndex === i ? "text-blue-600" : "text-headingColor"
                }`}
              >
                {song.name}
              </p>
              <p className="text-[11px] text-gray-500 truncate font-medium">
                {song.artist}
              </p>
            </div>

            {songIndex === i && (
              <div className="ml-auto text-[10px] font-bold text-blue-500 uppercase">
                Playing
              </div>
            )}
          </div>
        ))}

        {(!activeSongs || activeSongs.length === 0) && (
          <div className="w-full py-10 flex flex-col items-center justify-center text-gray-400 gap-2">
            <RiPlayListFill className="text-3xl opacity-20" />
            <p className="text-sm font-medium">Your queue is empty</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

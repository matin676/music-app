/**
 * Custom Music Player Component
 *
 * A fully custom audio player replacing react-h5-audio-player
 * Features:
 * - Custom seek bar with smooth animations
 * - Volume control with mute toggle
 * - Shuffle and repeat controls
 * - Mini player mode
 * - Keyboard controls
 */
import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoPlay,
  IoPause,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoVolumeHigh,
  IoVolumeMute,
  IoVolumeLow,
  IoShuffle,
  IoRepeat,
  IoChevronDown,
  IoChevronUp,
} from "react-icons/io5";
import { TbRepeatOnce } from "react-icons/tb";
import { usePlayerStore } from "../store/playerStore";
import "./MusicPlayer.css";

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);

  const {
    currentSong,
    isPlaying,
    isShuffle,
    repeatMode,
    volume,
    progress,
    duration,
    isMiniPlayer,
    pause,
    resume,
    next,
    previous,
    toggleShuffle,
    cycleRepeat,
    setVolume,
    setProgress,
    setDuration,
    toggleMiniPlayer,
  } = usePlayerStore();

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isSeeking) {
        setProgress(audio.currentTime);
        setLocalProgress(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isSeeking, repeatMode, next, setProgress, setDuration]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => pause());
    } else {
      audio.pause();
    }
  }, [isPlaying, currentSong, pause]);

  // Handle song change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    audio.src = currentSong.songURL;
    if (isPlaying) {
      audio.play().catch(() => pause());
    }
  }, [currentSong?.songURL]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          isPlaying ? pause() : resume();
          break;
        case "ArrowLeft":
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, progress - 10);
          }
          break;
        case "ArrowRight":
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, progress + 10);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, pause, resume, progress, duration, volume, setVolume]);

  // Seek handling
  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(
    (e) => {
      const audio = audioRef.current;
      const progress = progressRef.current;
      if (!audio || !progress) return;

      const rect = progress.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;

      audio.currentTime = newTime;
      setProgress(newTime);
      setLocalProgress(newTime);
      setIsSeeking(false);
    },
    [duration, setProgress],
  );

  const handleSeekMove = useCallback(
    (e) => {
      if (!isSeeking) return;

      const progress = progressRef.current;
      if (!progress) return;

      const rect = progress.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      setLocalProgress(percentage * duration);
    },
    [isSeeking, duration],
  );

  // Volume icon
  const VolumeIcon =
    volume === 0 ? IoVolumeMute : volume < 0.5 ? IoVolumeLow : IoVolumeHigh;

  // Repeat icon
  const RepeatIcon = repeatMode === "one" ? TbRepeatOnce : IoRepeat;

  if (!currentSong) return null;

  const displayProgress = isSeeking ? localProgress : progress;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`music-player ${isMiniPlayer ? "music-player-mini" : ""}`}
      >
        {/* Hidden audio element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Song Info */}
        <div className="player-song-info">
          <motion.img
            key={currentSong._id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={currentSong.imageURL}
            alt={currentSong.name}
            className="player-album-art"
          />
          <div className="player-text">
            <h4 className="player-song-name">{currentSong.name}</h4>
            <p className="player-artist-name">
              {Array.isArray(currentSong.artist)
                ? currentSong.artist.join(", ")
                : currentSong.artist}
            </p>
          </div>
        </div>

        {/* Main Controls */}
        <div className="player-main-controls">
          <div className="player-buttons">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`player-btn player-btn-sm ${isShuffle ? "active" : ""}`}
              title="Shuffle"
            >
              <IoShuffle />
            </button>

            {/* Previous */}
            <button onClick={previous} className="player-btn" title="Previous">
              <IoPlaySkipBack />
            </button>

            {/* Play/Pause */}
            <button
              onClick={() => (isPlaying ? pause() : resume())}
              className="player-btn player-btn-play"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <IoPause /> : <IoPlay />}
            </button>

            {/* Next */}
            <button onClick={next} className="player-btn" title="Next">
              <IoPlaySkipForward />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeat}
              className={`player-btn player-btn-sm ${repeatMode !== "none" ? "active" : ""}`}
              title={`Repeat: ${repeatMode}`}
            >
              <RepeatIcon />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="player-progress-container">
            <span className="player-time">{formatTime(displayProgress)}</span>
            <div
              ref={progressRef}
              className="player-progress"
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onMouseMove={handleSeekMove}
              onMouseLeave={() => isSeeking && handleSeekEnd}
            >
              <div
                className="player-progress-filled"
                style={{ width: `${(displayProgress / duration) * 100 || 0}%` }}
              >
                <div className="player-progress-thumb" />
              </div>
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="player-right-controls">
          {/* Volume */}
          <div className="player-volume">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="player-btn player-btn-sm"
              title="Mute"
            >
              <VolumeIcon />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="player-volume-slider"
            />
          </div>

          {/* Mini Player Toggle */}
          <button
            onClick={toggleMiniPlayer}
            className="player-btn player-btn-sm"
            title={isMiniPlayer ? "Expand" : "Minimize"}
          >
            {isMiniPlayer ? <IoChevronUp /> : <IoChevronDown />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MusicPlayer;

/**
 * PlayerBridge Component
 *
 * Syncs legacy context state (songIndex, allSongs) with the new Zustand playerStore.
 * This enables gradual migration - components can trigger playback through the old context,
 * and the new custom player will respond via the playerStore.
 */
import { useEffect } from "react";
import { useStateValue } from "../../context/StateProvider";
import { usePlayerStore } from "./store/playerStore";

const PlayerBridge = () => {
  const [{ allSongs, songIndex, isSongPlaying }] = useStateValue();
  const { play, pause, resume, currentSong, isPlaying } = usePlayerStore();

  // Sync context -> Zustand when song changes
  useEffect(() => {
    if (
      allSongs &&
      allSongs.length > 0 &&
      songIndex >= 0 &&
      songIndex < allSongs.length
    ) {
      const song = allSongs[songIndex];

      // Only update if song actually changed
      if (!currentSong || currentSong._id !== song._id) {
        play(song, allSongs, songIndex);
      }
    }
  }, [allSongs, songIndex, currentSong, play]);

  // Sync play/pause state from context to Zustand
  useEffect(() => {
    if (isSongPlaying && !isPlaying) {
      resume();
    } else if (!isSongPlaying && isPlaying) {
      pause();
    }
  }, [isSongPlaying, isPlaying, resume, pause]);

  // This component doesn't render anything
  return null;
};

export default PlayerBridge;

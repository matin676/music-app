/**
 * Player Store (Zustand)
 *
 * Manages all player-related state including:
 * - Current song and queue
 * - Playback state (playing, paused)
 * - Shuffle and repeat modes
 * - Volume
 *
 * This replaces the player-related actions from the old reducer
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * @typedef {Object} Song
 * @property {string} _id - Song ID
 * @property {string} name - Song name
 * @property {string} imageURL - Album art URL
 * @property {string} songURL - Audio file URL
 * @property {string[]} artist - Artist names
 * @property {string} album - Album name
 */

/**
 * @typedef {'none' | 'one' | 'all'} RepeatMode
 */

const initialState = {
  currentSong: null,
  queue: [],
  originalQueue: [], // Keep original order for un-shuffling
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  repeatMode: "none", // 'none' | 'one' | 'all'
  volume: 0.7,
  isMiniPlayer: false,
  progress: 0,
  duration: 0,
};

export const usePlayerStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ===== PLAYBACK ACTIONS =====

        /**
         * Play a song with an optional queue context
         * @param {Song} song - Song to play
         * @param {Song[]} queue - Queue of songs (defaults to just this song)
         * @param {number} index - Index of song in queue
         */
        play: (song, queue = [], index = 0) => {
          set({
            currentSong: song,
            queue: queue.length > 0 ? queue : [song],
            originalQueue: queue.length > 0 ? queue : [song],
            currentIndex: index,
            isPlaying: true,
          });
        },

        /**
         * Pause playback
         */
        pause: () => set({ isPlaying: false }),

        /**
         * Resume playback
         */
        resume: () => set({ isPlaying: true }),

        /**
         * Toggle play/pause
         */
        togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

        /**
         * Play the next song in queue
         */
        next: () => {
          const { queue, currentIndex, repeatMode, isShuffle } = get();
          if (queue.length === 0) return;

          let nextIndex;

          if (repeatMode === "one") {
            // Repeat same song
            nextIndex = currentIndex;
          } else if (isShuffle) {
            // Random next song
            nextIndex = Math.floor(Math.random() * queue.length);
          } else {
            // Next in sequence
            nextIndex = currentIndex + 1;

            // Handle end of queue
            if (nextIndex >= queue.length) {
              if (repeatMode === "all") {
                nextIndex = 0;
              } else {
                // Stop at end
                set({ isPlaying: false });
                return;
              }
            }
          }

          set({
            currentIndex: nextIndex,
            currentSong: queue[nextIndex],
            isPlaying: true,
          });
        },

        /**
         * Play the previous song in queue
         */
        previous: () => {
          const { queue, currentIndex, progress } = get();
          if (queue.length === 0) return;

          // If we're more than 3 seconds into the song, restart it
          if (progress > 3) {
            set({ progress: 0 });
            return;
          }

          let prevIndex = currentIndex - 1;
          if (prevIndex < 0) {
            prevIndex = queue.length - 1;
          }

          set({
            currentIndex: prevIndex,
            currentSong: queue[prevIndex],
            isPlaying: true,
          });
        },

        /**
         * Play a specific song from the queue
         * @param {number} index - Index in queue to play
         */
        playAtIndex: (index) => {
          const { queue } = get();
          if (index >= 0 && index < queue.length) {
            set({
              currentIndex: index,
              currentSong: queue[index],
              isPlaying: true,
            });
          }
        },

        // ===== SHUFFLE & REPEAT =====

        /**
         * Toggle shuffle mode
         */
        toggleShuffle: () => {
          const { isShuffle, queue, originalQueue, currentSong } = get();

          if (!isShuffle) {
            // Enable shuffle - randomize queue but keep current song
            const shuffled = [...queue].sort(() => Math.random() - 0.5);
            const currentIdx = shuffled.findIndex(
              (s) => s._id === currentSong?._id,
            );
            if (currentIdx > 0) {
              // Move current song to front
              [shuffled[0], shuffled[currentIdx]] = [
                shuffled[currentIdx],
                shuffled[0],
              ];
            }
            set({ isShuffle: true, queue: shuffled, currentIndex: 0 });
          } else {
            // Disable shuffle - restore original order
            const currentIdx = originalQueue.findIndex(
              (s) => s._id === currentSong?._id,
            );
            set({
              isShuffle: false,
              queue: originalQueue,
              currentIndex: currentIdx >= 0 ? currentIdx : 0,
            });
          }
        },

        /**
         * Cycle through repeat modes: none -> all -> one -> none
         */
        cycleRepeat: () => {
          const modes = ["none", "all", "one"];
          const { repeatMode } = get();
          const currentIdx = modes.indexOf(repeatMode);
          const nextMode = modes[(currentIdx + 1) % modes.length];
          set({ repeatMode: nextMode });
        },

        /**
         * Set repeat mode directly
         * @param {RepeatMode} mode
         */
        setRepeatMode: (mode) => set({ repeatMode: mode }),

        // ===== VOLUME & PROGRESS =====

        /**
         * Set volume level
         * @param {number} volume - Volume level (0-1)
         */
        setVolume: (volume) =>
          set({ volume: Math.max(0, Math.min(1, volume)) }),

        /**
         * Set current progress
         * @param {number} progress - Progress in seconds
         */
        setProgress: (progress) => set({ progress }),

        /**
         * Set song duration
         * @param {number} duration - Duration in seconds
         */
        setDuration: (duration) => set({ duration }),

        // ===== UI STATE =====

        /**
         * Toggle mini player mode
         */
        toggleMiniPlayer: () =>
          set((state) => ({ isMiniPlayer: !state.isMiniPlayer })),

        /**
         * Set mini player mode
         * @param {boolean} isMini
         */
        setMiniPlayer: (isMini) => set({ isMiniPlayer: isMini }),

        /**
         * Clear player state
         */
        clear: () => set(initialState),
      }),
      {
        name: "player-storage",
        // Only persist certain fields
        partialize: (state) => ({
          volume: state.volume,
          isShuffle: state.isShuffle,
          repeatMode: state.repeatMode,
        }),
      },
    ),
    { name: "PlayerStore" },
  ),
);

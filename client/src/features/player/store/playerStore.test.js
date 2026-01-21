/**
 * PlayerStore Unit Tests
 *
 * Tests for the Zustand player store that manages playback state.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { usePlayerStore } from "./playerStore";

// Helper to reset store between tests
const resetStore = () => {
  usePlayerStore.setState({
    currentSong: null,
    queue: [],
    originalQueue: [],
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: "none",
    volume: 0.7,
    isMiniPlayer: false,
    progress: 0,
    duration: 0,
  });
};

// Mock songs for testing
const mockSongs = [
  {
    _id: "1",
    name: "Song 1",
    artist: ["Artist 1"],
    songURL: "url1",
    imageURL: "img1",
  },
  {
    _id: "2",
    name: "Song 2",
    artist: ["Artist 2"],
    songURL: "url2",
    imageURL: "img2",
  },
  {
    _id: "3",
    name: "Song 3",
    artist: ["Artist 3"],
    songURL: "url3",
    imageURL: "img3",
  },
];

describe("PlayerStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("play()", () => {
    it("should set current song and start playing", () => {
      const { play } = usePlayerStore.getState();

      play(mockSongs[0], mockSongs, 0);

      const state = usePlayerStore.getState();
      expect(state.currentSong).toEqual(mockSongs[0]);
      expect(state.isPlaying).toBe(true);
      expect(state.queue).toEqual(mockSongs);
      expect(state.currentIndex).toBe(0);
    });

    it("should set queue to single song if no queue provided", () => {
      const { play } = usePlayerStore.getState();

      play(mockSongs[0]);

      const state = usePlayerStore.getState();
      expect(state.queue).toEqual([mockSongs[0]]);
    });
  });

  describe("pause() and resume()", () => {
    it("should pause playback", () => {
      const { play, pause } = usePlayerStore.getState();

      play(mockSongs[0], mockSongs, 0);
      pause();

      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });

    it("should resume playback", () => {
      const { play, pause, resume } = usePlayerStore.getState();

      play(mockSongs[0], mockSongs, 0);
      pause();
      resume();

      expect(usePlayerStore.getState().isPlaying).toBe(true);
    });
  });

  describe("next()", () => {
    it("should advance to next song", () => {
      const { play, next } = usePlayerStore.getState();

      play(mockSongs[0], mockSongs, 0);
      next();

      const state = usePlayerStore.getState();
      expect(state.currentIndex).toBe(1);
      expect(state.currentSong).toEqual(mockSongs[1]);
    });

    it("should loop to start when repeatMode is all", () => {
      usePlayerStore.setState({ repeatMode: "all" });
      const { play, next } = usePlayerStore.getState();

      play(mockSongs[2], mockSongs, 2); // Last song
      next();

      expect(usePlayerStore.getState().currentIndex).toBe(0);
    });

    it("should stop at end when no repeat", () => {
      usePlayerStore.setState({ repeatMode: "none" });
      const { play, next } = usePlayerStore.getState();

      play(mockSongs[2], mockSongs, 2); // Last song
      next();

      expect(usePlayerStore.getState().isPlaying).toBe(false);
    });
  });

  describe("previous()", () => {
    it("should go to previous song", () => {
      const { play, previous } = usePlayerStore.getState();

      play(mockSongs[1], mockSongs, 1);
      usePlayerStore.setState({ progress: 0 }); // Reset progress
      previous();

      const state = usePlayerStore.getState();
      expect(state.currentIndex).toBe(0);
      expect(state.currentSong).toEqual(mockSongs[0]);
    });

    it("should restart song if progress > 3 seconds", () => {
      const { play, previous } = usePlayerStore.getState();

      play(mockSongs[1], mockSongs, 1);
      usePlayerStore.setState({ progress: 10 });
      previous();

      expect(usePlayerStore.getState().progress).toBe(0);
      expect(usePlayerStore.getState().currentIndex).toBe(1); // Same song
    });
  });

  describe("toggleShuffle()", () => {
    it("should toggle shuffle mode", () => {
      const { toggleShuffle, play } = usePlayerStore.getState();

      play(mockSongs[0], mockSongs, 0);
      toggleShuffle();

      expect(usePlayerStore.getState().isShuffle).toBe(true);

      toggleShuffle();
      expect(usePlayerStore.getState().isShuffle).toBe(false);
    });
  });

  describe("cycleRepeat()", () => {
    it("should cycle through repeat modes", () => {
      const { cycleRepeat } = usePlayerStore.getState();

      expect(usePlayerStore.getState().repeatMode).toBe("none");

      cycleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("all");

      cycleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("one");

      cycleRepeat();
      expect(usePlayerStore.getState().repeatMode).toBe("none");
    });
  });

  describe("volume", () => {
    it("should set volume within bounds", () => {
      const { setVolume } = usePlayerStore.getState();

      setVolume(0.5);
      expect(usePlayerStore.getState().volume).toBe(0.5);

      setVolume(1.5); // Above max
      expect(usePlayerStore.getState().volume).toBe(1);

      setVolume(-0.5); // Below min
      expect(usePlayerStore.getState().volume).toBe(0);
    });
  });

  describe("mini player", () => {
    it("should toggle mini player mode", () => {
      const { toggleMiniPlayer } = usePlayerStore.getState();

      expect(usePlayerStore.getState().isMiniPlayer).toBe(false);

      toggleMiniPlayer();
      expect(usePlayerStore.getState().isMiniPlayer).toBe(true);
    });
  });
});

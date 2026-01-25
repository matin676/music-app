/**
 * Home Page Component
 *
 * Main landing page with featured songs, categories, and filtering.
 * Uses React Query for data fetching with automatic caching.
 */
import React, { useEffect, useMemo, useCallback } from "react";
import { IoArrowUp } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Fuse from "fuse.js";

import Header from "../Shared/Header";
import Filter from "../Shared/Filter";
import SearchBar from "../Shared/SearchBar";
import HeroSection from "./HeroSection";
import HorizontalSongCarousel from "./HorizontalSongCarousel";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import { useSongs } from "../../features/library/hooks";
import { usersApi } from "../../services/api/users";
import SEO from "../Shared/SEO";
import { SongCardSkeleton } from "../../shared/components";

export default function Home() {
  // Context for filters and favourites (still needed for cross-component state)
  const [
    {
      searchTerm,
      artistFilter,
      filterTerm,
      albumFilter,
      languageFilter,
      favourites,
      user,
    },
    dispatch,
  ] = useStateValue();

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = React.useState(searchTerm);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // ... inside component
  // React Query - fetch all public songs (Client-side filtering is smoother for fuzzy search)
  const { data: songs, isLoading } = useSongs({ isPublic: true });

  // Filter Logic
  const filteredSongs = useMemo(() => {
    if (!songs) return [];

    let result = songs;

    // 1. Fuzzy Search
    if (debouncedSearch) {
      const fuse = new Fuse(result, {
        keys: ["name", "artist", "album", "category", "language"],
        threshold: 0.4, // Matches "untopp" -> "Unstoppable"
        distance: 100,
      });
      result = fuse.search(debouncedSearch).map((r) => r.item);
    }

    // 2. Exact Filters
    if (filterTerm) {
      result = result.filter((song) => {
        // Handle array or string category
        const cats = Array.isArray(song.category)
          ? song.category
          : [song.category];
        return cats.some((c) => c.toLowerCase() === filterTerm.toLowerCase());
      });
    }

    if (artistFilter) {
      result = result.filter((song) => {
        const artists = Array.isArray(song.artist)
          ? song.artist
          : [song.artist];
        return artists.some(
          (a) => a.toLowerCase() === artistFilter.toLowerCase(),
        );
      });
    }

    if (albumFilter) {
      result = result.filter(
        (song) => song.album?.toLowerCase() === albumFilter.toLowerCase(),
      );
    }

    if (languageFilter) {
      result = result.filter(
        (song) => song.language?.toLowerCase() === languageFilter.toLowerCase(),
      );
    }

    return result;
  }, [
    songs,
    debouncedSearch,
    filterTerm,
    artistFilter,
    albumFilter,
    languageFilter,
  ]);

  // Sync songs to context for player compatibility
  useEffect(() => {
    if (songs && songs.length > 0) {
      dispatch({ type: actionType.SET_ALL_SONGS, allSongs: songs });
    }
  }, [songs, dispatch]);

  // Dynamic Featured Song Logic (Analytics Based)
  const [featuredIndex, setFeaturedIndex] = React.useState(0);
  const isHoverRef = React.useRef(false);

  // Derive top songs based on playCount
  const topSongs = useMemo(() => {
    if (!songs || songs.length === 0) return [];
    // Sort by playCount desc, then by createdAt desc
    return [...songs]
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
      .slice(0, 5);
  }, [songs]);

  // Set initial featured song (Top #1)
  useEffect(() => {
    if (topSongs && topSongs.length > 0) {
      // Find the index of the top song in the main 'songs' array
      const topSong = topSongs[0];
      const index = songs.findIndex((s) => s._id === topSong._id);
      if (index !== -1) setFeaturedIndex(index);
    }
  }, [topSongs, songs]);

  // Cycle through top 5 popular songs
  useEffect(() => {
    if (topSongs && topSongs.length > 0 && songs && songs.length > 0) {
      const interval = setInterval(() => {
        if (!isHoverRef.current) {
          setFeaturedIndex((prev) => {
            // Find current song in topSongs
            const currentSong = songs[prev];
            const currentTopIndex = topSongs.findIndex(
              (s) => s._id === currentSong?._id,
            );

            let nextTopIndex = 0;
            if (
              currentTopIndex !== -1 &&
              currentTopIndex < topSongs.length - 1
            ) {
              nextTopIndex = currentTopIndex + 1;
            }

            // Get the next song from topSongs and find its index in the main list
            const nextSong = topSongs[nextTopIndex];
            const nextMainIndex = songs.findIndex(
              (s) => s._id === nextSong._id,
            );

            return nextMainIndex !== -1 ? nextMainIndex : 0;
          });
        }
      }, 10000); // 10 seconds per featured track

      return () => clearInterval(interval);
    }
  }, [topSongs, songs]);

  const handleMouseEnter = () => {
    isHoverRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoverRef.current = false;
  };

  // Scroll to top button
  const [showTopBtn, setShowTopBtn] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle favorite handler
  const toggleFavorite = useCallback(
    async (songId) => {
      if (!user) {
        toast.error("Please login to manage favorites");
        return;
      }

      const isFavorited = favourites.includes(songId);

      // Optimistic Update
      dispatch({
        type: isFavorited
          ? actionType.REMOVE_TO_FAVORITES
          : actionType.ADD_TO_FAVORITES,
        index: songId,
      });

      // Sync with backend
      try {
        await usersApi.toggleFavourite(user?.user?._id, songId);
      } catch (error) {
        // Revert on error
        dispatch({
          type: isFavorited
            ? actionType.ADD_TO_FAVORITES
            : actionType.REMOVE_TO_FAVORITES,
          index: songId,
        });
        toast.error("Failed to update favorites");
      }
    },
    [favourites, user, dispatch],
  );

  // Get songs to display (filtered or all)
  const displaySongs = filteredSongs || songs;

  // Derive featured song
  const featuredSong = useMemo(
    () => songs?.[featuredIndex],
    [songs, featuredIndex],
  );

  // Memoized category grouping
  const categorizedSongs = useMemo(() => {
    if (!displaySongs) return {};

    const result = {};
    displaySongs.forEach((song) => {
      const categories = Array.isArray(song.category)
        ? song.category
        : [song.category];

      categories.forEach((cat) => {
        if (typeof cat !== "string") return;
        const category = cat.toLowerCase();
        if (!result[category]) {
          result[category] = [];
        }
        result[category].push(song);
      });
    });

    return result;
  }, [displaySongs]);

  // Memoized recent songs
  const recentSongs = useMemo(
    () => displaySongs?.slice(-10).reverse(),
    [displaySongs],
  );

  // Check if any filter is active
  const hasActiveFilters =
    searchTerm || artistFilter || albumFilter || languageFilter || filterTerm;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-transparent">
      <SEO
        title="Home"
        description="Explore the latest tunes, discover new artists, and dive into your favorite albums on MusicApp."
      />
      <Header />

      <main className="w-full p-4 md:p-6 flex flex-col items-center max-w-[1400px] flex-1">
        {/* Search Bar */}
        <SearchBar />

        {searchTerm.length > 0 && (
          <p className="my-4 text-base text-textColor">
            Searched for :{" "}
            <span className="text-xl text-headingColor font-bold">
              {searchTerm}
            </span>
          </p>
        )}

        {/* Filter Bar */}
        <Filter />

        {/* Hero Section - Only show if no filters active */}
        {!hasActiveFilters && featuredSong && (
          <div
            className="w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait">
              <HeroSection
                key={featuredSong._id}
                featuredSong={featuredSong}
                favourites={favourites}
                toggleFavorite={toggleFavorite}
                songIndex={featuredIndex}
              />
            </AnimatePresence>
          </div>
        )}

        {/* Recently Added Section - Only show if no filters active */}
        {!hasActiveFilters && recentSongs && recentSongs.length > 0 && (
          <HorizontalSongCarousel
            title="Recently Added"
            songs={recentSongs}
            favourites={favourites}
            toggleFavorite={toggleFavorite}
          />
        )}

        {/* Category Sections */}
        {Object.entries(categorizedSongs).map(([category, categorySongs]) => {
          if (!categorySongs || categorySongs.length === 0) return null;

          return (
            <HorizontalSongCarousel
              key={category}
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              songs={categorySongs}
              favourites={favourites}
              toggleFavorite={toggleFavorite}
            />
          );
        })}

        {/* Loading State */}
        {isLoading && (
          <div className="w-full py-8">
            <div className="flex overflow-x-auto gap-4 pb-4">
              {[...Array(5)].map((_, i) => (
                <SongCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Only show when loaded but no results */}
        {!isLoading &&
          songs &&
          (!displaySongs || displaySongs.length === 0) && (
            <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
              <p className="text-xl font-medium">No songs found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
      </main>

      {showTopBtn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 right-6 z-100 cursor-pointer"
          onClick={goToTop}
        >
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-500/50 hover:bg-blue-600 transition-all transform hover:scale-110">
            <IoArrowUp className="text-2xl text-white" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

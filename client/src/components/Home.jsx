import React, { useEffect, useMemo, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";

import Header from "./Header";
import Filter from "./Filter";
import SearchBar from "./SearchBar";
import HeroSection from "./HeroSection";
import HorizontalSongCarousel from "./HorizontalSongCarousel";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { useData } from "../hooks/useData";
import { updateUserFavourites } from "../api";
import SEO from "./SEO";

export default function Home() {
  const { fetchSongs } = useData();
  const [
    {
      searchTerm,
      allSongs,
      artistFilter,
      filterTerm,
      albumFilter,
      languageFilter,
      favourites,
      user,
    },
    dispatch,
  ] = useStateValue();

  // Dynamic Featured Song Logic
  const [featuredIndex, setFeaturedIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    // Clear all filters when component mounts (fixes issue when returning from dashboard)
    dispatch({ type: actionType.SET_ARTIST_FILTER, artistFilter: null });
    dispatch({ type: actionType.SET_LANGUAGE_FILTER, languageFilter: null });
    dispatch({ type: actionType.SET_ALBUM_FILTER, albumFilter: null });
    dispatch({ type: actionType.SET_FILTER_TERM, filterTerm: null });

    fetchSongs();
  }, [dispatch, fetchSongs]);

  useEffect(() => {
    if (allSongs && allSongs.length > 0) {
      // Set initial random song only if we haven't set one yet or if needed
      // Actually, we probably just want to keep the interval running.
      // If we want random start every time logic:
      // const randomIndex = Math.floor(Math.random() * allSongs.length);
      // setFeaturedIndex(randomIndex);
      // (Moving this initialization to a separate effect or memo if strictly needed 1-time,
      // but here is fine if we accept re-random on allSongs change which is rare)

      // Rotate every 6 minutes (360000ms)
      const interval = setInterval(() => {
        if (!isHovered) {
          setFeaturedIndex((prev) => {
            let nextIndex = Math.floor(Math.random() * allSongs.length);
            if (nextIndex === prev && allSongs.length > 1) {
              nextIndex = (prev + 1) % allSongs.length;
            }
            return nextIndex;
          });
        }
      }, 360000);

      return () => clearInterval(interval);
    }
  }, [allSongs, isHovered]);

  // Memoized filtering logic
  const filteredSongs = useMemo(() => {
    if (!allSongs) return null;

    if (searchTerm && searchTerm.length > 0) {
      return allSongs.filter(
        (data) =>
          data.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (artistFilter) {
      return allSongs.filter((data) => data.artist === artistFilter);
    }

    if (albumFilter) {
      return allSongs.filter((data) => data.album === albumFilter);
    }

    if (languageFilter) {
      return allSongs.filter((data) => data.language === languageFilter);
    }

    if (filterTerm) {
      return allSongs.filter(
        (data) => data.category.toLowerCase() === filterTerm
      );
    }

    return null;
  }, [
    searchTerm,
    artistFilter,
    albumFilter,
    languageFilter,
    filterTerm,
    allSongs,
  ]);

  // Memoized toggle favorite handler
  const toggleFavorite = useCallback(
    async (songId) => {
      if (!user) return;

      const isFavorited = favourites.includes(songId);

      // Optimistic Update
      dispatch({
        type: isFavorited
          ? actionType.REMOVE_TO_FAVORITES
          : actionType.ADD_TO_FAVORITES,
        index: songId,
      });

      // Sync with backend
      await updateUserFavourites(user?.user?._id, songId);

      // LocalStorage sync
      const updatedFavorites = isFavorited
        ? favourites.filter((id) => id !== songId)
        : [...favourites, songId];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    },
    [favourites, user, dispatch]
  );

  // Get songs to display (filtered or all)
  const displaySongs = filteredSongs || allSongs;

  // Derive featured song
  const featuredSong = useMemo(
    () => allSongs?.[featuredIndex],
    [allSongs, featuredIndex]
  );

  // Memoized category grouping
  const categorizedSongs = useMemo(() => {
    if (!displaySongs) return {};

    const categories = [
      "rock",
      "jazz",
      "pop",
      "folk",
      "classical",
      "electronic",
      "country",
      "metal",
      "soul",
      "disco",
      "party",
    ];

    const result = {};
    categories.forEach((category) => {
      result[category] = displaySongs.filter(
        (song) => song.category.toLowerCase() === category
      );
    });

    return result;
  }, [displaySongs]);

  // Memoized recent songs
  const recentSongs = useMemo(
    () => displaySongs?.slice(-10).reverse(),
    [displaySongs]
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
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
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

        {/* Recently Added Section */}
        {recentSongs && recentSongs.length > 0 && (
          <HorizontalSongCarousel
            title="Recently Added"
            songs={recentSongs}
            favourites={favourites}
            toggleFavorite={toggleFavorite}
          />
        )}

        {/* Category Sections */}
        {Object.entries(categorizedSongs).map(([category, songs]) => {
          if (!songs || songs.length === 0) return null;

          return (
            <HorizontalSongCarousel
              key={category}
              title={category.charAt(0).toUpperCase() + category.slice(1)}
              songs={songs}
              favourites={favourites}
              toggleFavorite={toggleFavorite}
            />
          );
        })}

        {/* Empty State */}
        {(!displaySongs || displaySongs.length === 0) && (
          <div className="w-full py-20 flex flex-col items-center justify-center text-gray-400">
            <p className="text-xl font-medium">No songs found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}

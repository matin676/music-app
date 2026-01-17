import React, { useEffect, useMemo, useCallback } from "react";
import { IoArrowUp } from "react-icons/io5";

import { motion, AnimatePresence } from "framer-motion";

import Header from "../Shared/Header";
import Filter from "../Shared/Filter";
import SearchBar from "../Shared/SearchBar";
import HeroSection from "./HeroSection";
import HorizontalSongCarousel from "./HorizontalSongCarousel";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import { useData } from "../../hooks/useData";
import { updateUserFavourites } from "../../api";
import SEO from "../Shared/SEO";

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
  const [isHovered, setIsHovered] = React.useState(false); // Keep for UI if needed, or remove if not used for rendering
  const isHoverRef = React.useRef(false); // Ref for interval access

  useEffect(() => {
    if (allSongs && allSongs.length > 0) {
      // Only set initial random index if we haven't yet (or maybe just once on mount/songs load)
      // Actually, we can just set it once when songs load.
      // But to prevent it from resetting on every dependency change, we should check if we really need to.
      // For now, let's rely on the fact that we'll separate the interval.
      const randomIndex = Math.floor(Math.random() * allSongs.length);
      setFeaturedIndex(randomIndex);
    }
  }, [allSongs]); // Run only when allSongs changes

  useEffect(() => {
    if (allSongs && allSongs.length > 0) {
      const interval = setInterval(() => {
        if (!isHoverRef.current) {
          setFeaturedIndex((prev) => {
            let nextIndex = Math.floor(Math.random() * allSongs.length);
            // Ensure we don't pick the same song twice in a row if possible
            if (nextIndex === prev && allSongs.length > 1) {
              nextIndex = (prev + 1) % allSongs.length;
            }
            return nextIndex;
          });
        }
      }, 360000); // 6 minutes

      return () => clearInterval(interval);
    }
  }, [allSongs]); // Independent of isHovered state

  const handleMouseEnter = () => {
    setIsHovered(true);
    isHoverRef.current = true;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    isHoverRef.current = false;
  };

  const [showTopBtn, setShowTopBtn] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Memoized filtering logic
  const filteredSongs = useMemo(() => {
    if (!allSongs) return null;

    if (searchTerm && searchTerm.length > 0) {
      return allSongs.filter((data) => {
        const artistMatch = Array.isArray(data.artist)
          ? data.artist.some(
              (a) =>
                typeof a === "string" &&
                a.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : typeof data.artist === "string" &&
            data.artist.toLowerCase().includes(searchTerm.toLowerCase());

        const languageMatch =
          typeof data.language === "string" &&
          data.language.toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatch =
          typeof data.name === "string" &&
          data.name.toLowerCase().includes(searchTerm.toLowerCase());

        return artistMatch || languageMatch || nameMatch;
      });
    }

    if (artistFilter) {
      return allSongs.filter((data) =>
        Array.isArray(data.artist)
          ? data.artist.includes(artistFilter)
          : data.artist === artistFilter
      );
    }

    if (albumFilter) {
      return allSongs.filter((data) => data.album === albumFilter);
    }

    if (languageFilter) {
      return allSongs.filter((data) => data.language === languageFilter);
    }

    if (filterTerm) {
      return allSongs.filter((data) =>
        Array.isArray(data.category)
          ? data.category.some(
              (c) => typeof c === "string" && c.toLowerCase() === filterTerm
            )
          : typeof data.category === "string" &&
            data.category.toLowerCase() === filterTerm
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

  // Alert State
  const [alert, setAlert] = React.useState(false);
  const [alertMsg, setAlertMsg] = React.useState(null);

  const alertConfig = (status, msg) => {
    setAlert(status);
    setAlertMsg(msg);
    setTimeout(() => {
      setAlert(null);
      setAlertMsg(null);
    }, 4000);
  };

  // Memoized toggle favorite handler
  const toggleFavorite = useCallback(
    async (songId) => {
      if (!user) {
        alertConfig("error", "Please login to manage favorites");
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
      await updateUserFavourites(user?.user?._id, songId);
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

    const result = {};

    // Dynamically categorize songs based on their category field
    displaySongs.forEach((song) => {
      // Normalize category to array
      const categories = Array.isArray(song.category)
        ? song.category
        : [song.category];

      categories.forEach((cat) => {
        if (typeof cat !== "string") return;
        const category = cat.toLowerCase(); // Ensure lowercase key
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

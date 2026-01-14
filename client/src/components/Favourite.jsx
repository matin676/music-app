import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoHeartOutline, IoHeart, IoHeartDislike } from "react-icons/io5";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { updateUserFavourites } from "../api";
import SEO from "./SEO";

export default function Favourite() {
  const [{ user }, dispatch] = useStateValue();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user?.user?.favourites) {
      setFavorites(user.user.favourites);
      localStorage.setItem("favorites", JSON.stringify(user.user.favourites));
    } else {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    }
  }, [user]);

  return (
    <div className="w-full h-auto flex flex-col items-center bg-transparent">
      <SEO
        title="My Favourites"
        description="Listen to and manage your favorite tracks on MusicApp."
      />
      <Header />

      <main className="w-full max-w-6xl p-3 md:p-6 flex flex-col gap-4 md:gap-6">
        <h2 className="text-2xl md:text-3xl font-bold text-headingColor flex items-center gap-2">
          <IoHeart className="text-xl md:text-2xl text-red-500" /> My Favourites
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          <FavouriteContainer
            favorites={favorites}
            setFavorites={setFavorites}
          />
        </div>
      </main>
    </div>
  );
}

export const FavouriteContainer = ({ favorites, setFavorites }) => {
  const [{ isSongPlaying, songIndex, allSongs, user }, dispatch] =
    useStateValue();

  const toggleFavourite = async (songId) => {
    if (!user) return;

    const isFavorited = favorites.includes(songId);

    // Optimistic Update
    const updatedFavorites = isFavorited
      ? favorites.filter((id) => id !== songId)
      : [...favorites, songId];

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    dispatch({
      type: isFavorited
        ? actionType.REMOVE_TO_FAVORITES
        : actionType.ADD_TO_FAVORITES,
      index: songId, // index used as key in reducer but passing songId
    });

    // Sync with backend
    await updateUserFavourites(user?.user?._id, songId);
  };

  const addSongToContext = (localIndex) => {
    if (!isSongPlaying) {
      dispatch({ type: actionType.SET_ISSONG_PLAYING, isSongPlaying: true });
    }

    // Get favorite songs array by mapping IDs to song objects
    const favoriteSongs = favorites
      .map((id) => allSongs?.find((song) => song._id === id))
      .filter(Boolean);

    // Set the current playlist context to favorite songs
    dispatch({
      type: actionType.SET_CURRENT_PLAYLIST,
      currentPlaylist: favoriteSongs,
    });

    // Set the song index within favorites
    dispatch({ type: actionType.SET_SONG_INDEX, songIndex: localIndex });
  };

  if (!allSongs) return null;

  return (
    <>
      <div className="col-span-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6 w-full">
        {favorites?.map((songId, localIndex) => {
          const data = allSongs?.find((song) => song._id === songId);
          if (!data) return null;

          return (
            <motion.div
              key={data._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="relative w-full bg-white/30 backdrop-blur-md border border-white/40 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
              onClick={() => addSongToContext(localIndex)}
            >
              {/* Image */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-md mb-3 md:mb-4">
                <img
                  src={data.imageURL}
                  alt={data.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-bold tracking-wider uppercase text-xs border border-white/50 px-2 py-1 rounded-md backdrop-blur-md">
                    Play
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col items-start gap-0.5 md:gap-1 w-full">
                <p className="text-sm md:text-base font-bold text-headingColor truncate w-full">
                  {data.name}
                </p>
                <p className="text-xs text-gray-800 font-medium truncate w-full opacity-70">
                  {data.artist}
                </p>
              </div>

              {/* Remove Button */}
              <button
                className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 md:p-2 bg-white/80 hover:bg-red-500 hover:text-white rounded-full text-red-500 shadow-sm transition-all z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(data._id);
                }}
                title="Remove from favorites"
              >
                <IoHeartDislike className="text-base md:text-lg" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {favorites.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20 animate-pulse">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <IoHeartDislike className="text-4xl text-red-400" />
          </div>
          <p className="text-xl font-bold text-gray-500">
            No favorites added yet
          </p>
          <p className="text-sm text-gray-400">
            Go explore and like some songs!
          </p>
        </div>
      )}
    </>
  );
};

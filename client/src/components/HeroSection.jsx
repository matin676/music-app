import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { IoPlayCircle, IoHeart, IoHeartOutline } from "react-icons/io5";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";

export default function HeroSection({
  featuredSong,
  favourites,
  toggleFavorite,
  songIndex: featuredIndex,
}) {
  const [{ isSongPlaying, songIndex }, dispatch] = useStateValue();

  const playSong = () => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }
    if (songIndex !== featuredIndex) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: featuredIndex,
      });
    }
  };

  if (!featuredSong) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-8 relative overflow-hidden rounded-3xl"
    >
      {/* Background Image with Gradient Overlay */}
      <div className="relative h-[400px] md:h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${featuredSong.imageURL})`,
            filter: "blur(20px) brightness(0.7)",
            transform: "scale(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-end p-4 sm:p-6 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 w-full">
            {/* Album Art */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl overflow-hidden shrink-0"
            >
              <img
                src={featuredSong.imageURL}
                alt={featuredSong.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Song Details */}
            <div className="flex-1 flex flex-col justify-end gap-3 md:gap-4 text-center md:text-left">
              <div>
                <p className="text-xs sm:text-sm md:text-base text-white/80 font-medium uppercase tracking-wider mb-1 md:mb-2">
                  Featured Track
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-1 md:mb-2 drop-shadow-lg leading-tight">
                  {featuredSong.name}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium">
                  {featuredSong.artist}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 mt-2 md:mt-3 flex-wrap">
                  <span className="px-2 md:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium border border-white/30">
                    {featuredSong.category}
                  </span>
                  <span className="px-2 md:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-medium border border-white/30">
                    {featuredSong.language}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playSong}
                  className="flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-white text-headingColor rounded-full shadow-2xl hover:shadow-white/20 font-bold text-base md:text-lg transition-all"
                >
                  <IoPlayCircle className="text-2xl md:text-3xl" />
                  <span className="hidden sm:inline">Play Now</span>
                  <span className="sm:hidden">Play</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(featuredSong._id);
                  }}
                  className="p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 text-white hover:bg-white/30 transition-all"
                >
                  {favourites?.includes(featuredSong._id) ? (
                    <IoHeart className="text-2xl text-red-500" />
                  ) : (
                    <IoHeartOutline className="text-2xl" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

HeroSection.propTypes = {
  featuredSong: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageURL: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    category: PropTypes.string,
    language: PropTypes.string,
  }),
  favourites: PropTypes.array,
  toggleFavorite: PropTypes.func.isRequired,
  songIndex: PropTypes.number.isRequired,
};

import React, { useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { IoHeart, IoHeartOutline, IoPlayCircle } from "react-icons/io5";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";

const HorizontalSongCarousel = ({
  title,
  songs,
  favourites,
  toggleFavorite,
}) => {
  const [{ isSongPlaying, songIndex, allSongs }, dispatch] = useStateValue();
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const addSongToContext = (localIndex) => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }

    // Set the current playlist context to this carousel's songs
    dispatch({
      type: actionType.SET_CURRENT_PLAYLIST,
      currentPlaylist: songs,
    });

    // Set the song index within this carousel
    dispatch({
      type: actionType.SET_SONG_INDEX,
      songIndex: localIndex,
    });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-headingColor mb-3 md:mb-4 px-2">
        {title}
      </h2>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className={`flex gap-3 md:gap-6 overflow-x-auto pb-4 px-2 scrollbar-hide ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } select-none`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {songs?.map((data, index) => (
            <motion.div
              key={data._id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative min-w-[140px] w-[140px] sm:min-w-[160px] sm:w-[160px] md:min-w-[180px] md:w-[180px] p-3 md:p-4 cursor-pointer bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-white/30 flex flex-col items-center group transition-all"
              onClick={() => addSongToContext(index)}
            >
              {/* Image Container */}
              <div className="w-full aspect-square rounded-xl drop-shadow-md relative overflow-hidden mb-3">
                <img
                  src={data.imageURL}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <IoPlayCircle className="text-6xl text-white drop-shadow-lg" />
                </div>
                {/* Favorite Button */}
                <div className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className="p-1.5 md:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-red-500 cursor-pointer hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(data._id);
                    }}
                  >
                    {favourites?.includes(data._id) ? (
                      <IoHeart className="text-base md:text-lg" />
                    ) : (
                      <IoHeartOutline className="text-base md:text-lg" />
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Song Info */}
              <div className="flex flex-col items-center w-full">
                <p className="text-sm font-bold text-headingColor text-center truncate w-full px-1">
                  {data.name}
                </p>
                <p className="text-xs text-gray-500 font-medium text-center truncate w-full px-1 mt-1">
                  {data.artist}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(HorizontalSongCarousel);

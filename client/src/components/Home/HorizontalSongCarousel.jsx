import React, { useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import { IoHeart, IoHeartOutline, IoPlayCircle, IoAdd } from "react-icons/io5";
import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import AddToPlaylistModal from "../Shared/AddToPlaylistModal";
import AlertSuccess from "../Shared/AlertSuccess";
import AlertError from "../Shared/AlertError";

const HorizontalSongCarousel = ({
  title,
  songs,
  favourites,
  toggleFavorite,
}) => {
  const [{ isSongPlaying, songIndex, allSongs, user }, dispatch] =
    useStateValue();
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [songToAdd, setSongToAdd] = useState(null);

  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const alertConfig = (status, msg) => {
    setAlert(status);
    setAlertMsg(msg);
    setTimeout(() => {
      setAlert(null);
      setAlertMsg(null);
    }, 4000);
  };

  const addSongToContext = (localIndex) => {
    // ... existing code ...
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }

    dispatch({
      type: actionType.SET_CURRENT_PLAYLIST,
      currentPlaylist: songs,
    });

    dispatch({
      type: actionType.SET_SONG_INDEX,
      songIndex: localIndex,
    });
  };

  // ... event handlers ...
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
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="relative min-w-[140px] w-[140px] sm:min-w-[160px] sm:w-[160px] md:min-w-[180px] md:w-[180px] p-3 md:p-4 cursor-pointer bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-white/30 flex flex-col items-center group transition-all hover:scale-105 hover:-translate-y-1 hover:z-50"
              onClick={() => addSongToContext(index)}
            >
              {/* Image Container */}
              <div className="w-full aspect-square rounded-xl drop-shadow-md relative overflow-hidden mb-3">
                <img
                  src={data.imageURL}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300"
                  loading="lazy"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <IoPlayCircle className="text-6xl text-white drop-shadow-lg" />
                </div>
                {/* Favorite Button */}
                <div className="absolute top-2 right-2 z-50 flex flex-col gap-2">
                  <button
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-red-500 hover:scale-110 active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(data._id);
                    }}
                  >
                    {favourites?.includes(data._id) ? (
                      <IoHeart className="text-xl" />
                    ) : (
                      <IoHeartOutline className="text-xl" />
                    )}
                  </button>

                  <button
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-headingColor hover:scale-110 active:scale-95 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!user) {
                        alertConfig("error", "Please login to add to playlist");
                      } else {
                        setSongToAdd(data);
                      }
                    }}
                  >
                    <IoAdd className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Song Info */}
              <div className="flex flex-col items-center w-full">
                <p className="text-sm font-bold text-headingColor text-center truncate w-full px-1">
                  {data.name}
                </p>
                <p className="text-xs text-gray-500 font-medium text-center truncate w-full px-1 mt-1">
                  {Array.isArray(data.artist)
                    ? data.artist.join(", ")
                    : data.artist}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {songToAdd && (
        <AddToPlaylistModal
          song={songToAdd}
          closeModal={() => setSongToAdd(null)}
          alertConfig={alertConfig}
        />
      )}

      {alert && (
        <div className="fixed top-24 right-4 z-1050">
          {alert === "success" ? (
            <AlertSuccess msg={alertMsg} />
          ) : (
            <AlertError msg={alertMsg} />
          )}
        </div>
      )}
    </div>
  );
};

export default memo(HorizontalSongCarousel);

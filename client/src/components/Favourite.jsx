import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoHeartOutline, IoHeart } from "react-icons/io5";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";

export default function Favourite() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center bg-primary">
      <Header />
      <p className="text-2xl font-semibold text-headingColor">My Favourites</p>
      <div className="w-full h-auto flex items-center justify-evenly gap-4 flex-wrap p-4">
        <FavouriteContainer favorites={favorites} setFavorites={setFavorites} />
      </div>
    </div>
  );
}

export const FavouriteContainer = ({ favorites, setFavorites }) => {
  const [{ isSongPlaying, songIndex, allSongs }, dispatch] = useStateValue();

  useEffect(() => {
    console.log("FavouriteContainer re-rendered with favorites:", favorites);
  }, [favorites]);

  const toggleFavourite = (index) => {
    const updatedFavorites = [...favorites];
    const favIndex = updatedFavorites.indexOf(index);
    if (favIndex !== -1) {
      updatedFavorites.splice(favIndex, 1);
    } else {
      updatedFavorites.push(index);
    }
    setFavorites(updatedFavorites);
    dispatch({
      type:
        favIndex !== -1
          ? actionType.REMOVE_TO_FAVORITES
          : actionType.ADD_TO_FAVORITES,
      index: index,
    });
  };

  const addSongToContext = (index) => {
    if (!isSongPlaying) {
      dispatch({
        type: actionType.SET_ISSONG_PLAYING,
        isSongPlaying: true,
      });
    }
    if (songIndex !== index) {
      dispatch({
        type: actionType.SET_SONG_INDEX,
        songIndex: index,
      });
    }
  };

  return (
    <>
      {favorites?.map((index) => {
        const data = allSongs[index];
        return (
          <motion.div
            key={data._id}
            whileTap={{ scale: 0.8 }}
            className="relative w-40 min-w-210 px-2 py-4 cursor-pointer hover:shadow-xl hover:bg-card bg-gray-100 shadow-md rounded-lg flex flex-col items-center"
            onClick={() => addSongToContext(index)}
          >
            <div className="w-40 min-w-[160px] h-40 min-h-[160px] rounded-lg drop-shadow-lg relative overflow-hidden">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={data.imageURL}
                alt=""
                className=" w-full h-full rounded-lg object-cover"
              />
            </div>

            <p className="text-base text-headingColor font-semibold my-2 text-center">
              {data.name.length > 20
                ? `${data.name.slice(0, 20)}...`
                : data.name}
              <span className="block text-sm text-gray-400 my-1">
                {data.artist}
              </span>
            </p>
            <div className="w-full absolute bottom-2 right-2 flex items-center justify-between px-4">
              <motion.i
                whileTap={{ scale: 0.75 }}
                className="text-base text-red-400 drop-shadow-md hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(index);
                }}
              >
                {favorites.includes(index) ? <IoHeart /> : <IoHeartOutline />}
              </motion.i>
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

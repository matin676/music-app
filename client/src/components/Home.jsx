import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoHeartOutline, IoHeart } from "react-icons/io5";

import Header from "./Header";
import Filter from "./Filter";
import SearchBar from "./SearchBar";
import SongCard from "./SongCard";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { getAllSongs } from "../api";

export default function Home() {
  const [
    {
      searchTerm,
      isSongPlaying,
      songIndex,
      allSongs,
      artistFilter,
      filterTerm,
      albumFilter,
      languageFilter,
      favourites,
    },
    dispatch,
  ] = useStateValue();

  const [filteredSongs, setFilteredSongs] = useState(null);

  useEffect(() => {
    if (!allSongs) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.song,
        });
      });
    }
    setFilteredSongs(null);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allSongs.filter(
        (data) =>
          data.artist.toLowerCase().includes(searchTerm) ||
          data.language.toLowerCase().includes(searchTerm) ||
          data.name.toLowerCase().includes(searchTerm) ||
          data.artist.includes(artistFilter)
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [searchTerm, artistFilter, allSongs]);

  useEffect(() => {
    const filtered = allSongs?.filter((data) => data.artist === artistFilter);
    if (filtered) {
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(filtered);
    }
  }, [artistFilter]);

  useEffect(() => {
    const filtered = allSongs?.filter((data) => data.album === albumFilter);
    if (filtered) {
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [albumFilter]);

  useEffect(() => {
    const filtered = allSongs?.filter(
      (data) => data.language === languageFilter
    );
    if (filtered) {
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [languageFilter]);

  useEffect(() => {
    const filtered = allSongs?.filter(
      (data) => data.category.toLowerCase() === filterTerm
    );
    if (filtered) {
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs(null);
    }
  }, [filterTerm]);

  const toggleFavorite = (index) => {
    if (favourites.includes(index)) {
      dispatch({
        type: actionType.REMOVE_TO_FAVORITES,
        index,
      });
      const updatedFavorites = favourites.filter(
        (favIndex) => favIndex !== index
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      dispatch({
        type: actionType.ADD_TO_FAVORITES,
        index,
      });
      const updatedFavorites = [...favourites, index];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    }
  };

  return (
    <div className="w-full h-auto flex flex-col items-center justify-center bg-primary">
      <Header />
      <SearchBar />

      {searchTerm.length > 0 && (
        <p className="my-4 text-base text-textColor">
          Searched for :{" "}
          <span className="text-xl text-cartBg font-semibold">
            {searchTerm}
          </span>
        </p>
      )}

      <Filter setFilteredSongs={setFilteredSongs} />

      <div className="w-full h-auto flex items-center justify-evenly gap-4 flex-wrap p-4">
        <HomeSongContainer
          musics={filteredSongs ? filteredSongs : allSongs}
          toggleFavorite={toggleFavorite}
          favourites={favourites}
        />
      </div>
    </div>
  );
}

export const HomeSongContainer = ({ musics, toggleFavorite, favourites }) => {
  const [{ isSongPlaying, songIndex }, dispatch] = useStateValue();

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
      {musics?.map((data, index) => (
        <motion.div
          key={data._id}
          whileTap={{ scale: 0.8 }}
          initial={{ opacity: 0, translateX: -50 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative w-40 min-w-210 px-2 py-4 cursor-pointer hover:shadow-xl hover:bg-card bg-gray-100 shadow-md rounded-lg flex flex-col items-center"
          onClick={(e) => {
            e.stopPropagation();
            addSongToContext(index);
          }}
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
            {data.name.length > 20 ? `${data.name.slice(0, 20)}...` : data.name}
            <span className="block text-sm text-gray-400 my-1">
              {data.artist}
            </span>
          </p>
          <div className="w-full absolute bottom-2 right-2 flex items-center justify-between px-4">
            <motion.i
              whileTap={{ scale: 0.75 }}
              className="text-base text-red-400 drop-shadow-md hover:text-red-600"
              onClick={(e) => e.stopPropagation()}
            >
              {favourites.includes(index) ? (
                <IoHeart onClick={() => toggleFavorite(index)} />
              ) : (
                <IoHeartOutline onClick={() => toggleFavorite(index)} />
              )}
            </motion.i>
          </div>
        </motion.div>
      ))}
    </>
  );
};

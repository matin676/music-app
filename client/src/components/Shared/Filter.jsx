import React, { useEffect } from "react";
import { actionType } from "../../context/reducer";
import { useStateValue } from "../../context/StateProvider";
import { getAllAlbums, getAllArtists } from "../../api";
import { filterByLanguage, filters } from "../../utils/supportfunctions";
import FilterButtons from "./FilterButtons";
import { MdClearAll } from "react-icons/md";
import { motion } from "framer-motion";

import { useData } from "../../hooks/useData";

export default function Filter() {
  const { fetchArtists, fetchAlbums } = useData();
  const [
    {
      filterTerm,
      artistFilter,
      albumFilter,
      languageFilter,
      allArtists,
      allAlbums,
    },
    dispatch,
  ] = useStateValue();

  useEffect(() => {
    fetchArtists();
    fetchAlbums();
  }, [fetchArtists, fetchAlbums]);

  const updateFilter = (value) => {
    dispatch({
      type: actionType.SET_FILTER_TERM,
      filterTerm: value,
    });
  };

  const clearAllFilter = () => {
    dispatch({ type: actionType.SET_ARTIST_FILTER, artistFilter: null });
    dispatch({ type: actionType.SET_LANGUAGE_FILTER, languageFilter: null });
    dispatch({ type: actionType.SET_ALBUM_FILTER, albumFilter: null });
    dispatch({ type: actionType.SET_FILTER_TERM, filterTerm: null });
  };

  return (
    <div className="w-full my-3 md:my-4 px-2 sm:px-4 md:px-6 py-2 md:py-4 flex flex-col items-center justify-center relative z-100">
      {/* Mobile: Wrapped grid layout */}
      <div className="w-full md:hidden flex flex-col items-center gap-2">
        <div className="w-full grid grid-cols-2 gap-2">
          <FilterButtons filterData={allArtists} flag={"Artist"} />
          <FilterButtons filterData={allAlbums} flag={"Albums"} />
          <FilterButtons filterData={filters} flag={"Category"} />
          <FilterButtons filterData={filterByLanguage} flag={"Language"} />
        </div>

        {/* Clear button - Full width or Centered */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={clearAllFilter}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 rounded-full transition-all w-1/2 mt-1 shadow-sm"
        >
          <MdClearAll className="text-red-600 text-lg" />
          <span className="text-red-600 text-sm font-semibold">
            Clear Filters
          </span>
        </motion.button>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:flex w-full items-center justify-between gap-4 flex-wrap">
        <FilterButtons filterData={allArtists} flag={"Artist"} />
        <FilterButtons filterData={allAlbums} flag={"Albums"} />

        <div className="flex items-center gap-6 mx-4 overflow-x-scroll scrollbar-hide py-2 md:py-0">
          {filters?.map((data) => (
            <p
              key={data.id}
              onClick={() => updateFilter(data.value)}
              className={`text-base whitespace-nowrap ${
                data.value === filterTerm
                  ? "font-bold text-headingColor"
                  : "font-normal text-textColor"
              } cursor-pointer hover:font-bold hover:text-headingColor transition-all duration-100 ease-in-out`}
            >
              {data.name}
            </p>
          ))}
        </div>

        <FilterButtons filterData={filterByLanguage} flag={"Language"} />

        <div className="flex items-center gap-4 ml-auto">
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={clearAllFilter}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-full cursor-pointer transition-all"
          >
            <MdClearAll className="text-red-500 text-xl" />
            <p className="text-red-500 text-sm font-semibold">Clear All</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

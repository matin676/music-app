import React from "react";
import { IoSearch } from "react-icons/io5";

import { actionType } from "../../context/reducer";
import { useStateValue } from "../../context/StateProvider";

export default function SearchBar() {
  const [{ searchTerm }, dispatch] = useStateValue();

  const setSearchTerm = (value) => {
    dispatch({
      type: actionType.SET_SEARCH_TERM,
      searchTerm: value,
    });
  };

  return (
    <div className="w-full my-4 md:my-6 flex items-center justify-center">
      <div className="w-full md:w-2/3 max-w-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-lg rounded-2xl px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 transition-all hover:shadow-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <IoSearch className="text-xl md:text-2xl text-gray-500 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search songs, artists..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-base md:text-lg text-headingColor placeholder-gray-400 border-none outline-none"
        />
      </div>
    </div>
  );
}

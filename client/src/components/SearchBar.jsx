import React from "react";
import { IoSearch } from "react-icons/io5";

import { actionType } from "../context/reducer";
import { useStateValue } from "../context/StateProvider";

export default function SearchBar() {
  const [{ searchTerm }, dispatch] = useStateValue();

  const setSearchTerm = (value) => {
    dispatch({
      type: actionType.SET_SEARCH_TERM,
      searchTerm: value,
    });
  };

  return (
    <div className="w-full my-4 h-16 bg-card flex items-center justify-center">
      <div className="w-full gap-4 p-4 md:w-2/3 bg-primary shadow-xl mt-12 rounded-md flex items-center">
        <IoSearch className="text-2xl text-textColor" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search here ...."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-full bg-transparent text-lg text-textColor border-none outline-none"
        />
      </div>
    </div>
  );
}

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  memo,
} from "react";
import { IoChevronDown } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";

const FilterButtons = ({ flag, filterData }) => {
  const [filterName, setFilterName] = useState(null);
  const [filterMenu, setFilterMenu] = useState(false);
  const [{ artistFilter, albumFilter, filterTerm, languageFilter }, dispatch] =
    useStateValue();
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const calculatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth =
        window.innerWidth < 768 ? Math.min(240, window.innerWidth - 32) : 192;

      let left = rect.left;
      // Check if dropdown would go off-screen on the right
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 16;
      }
      // Check if dropdown would go off-screen on the left
      if (left < 16) {
        left = 16;
      }

      setDropdownPos({
        top: rect.bottom + 8,
        left: left,
      });
    }
  };

  useLayoutEffect(() => {
    if (filterMenu) {
      calculatePosition();
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition, true);
    }
    return () => {
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, [filterMenu]);

  const updateFilterButton = (value, displayName) => {
    setFilterMenu(false);
    setFilterName(displayName || value);

    if (flag === "Artist") {
      dispatch({
        type: actionType.SET_ARTIST_FILTER,
        artistFilter: value,
      });
    }
    if (flag === "Albums") {
      dispatch({
        type: actionType.SET_ALBUM_FILTER,
        albumFilter: value,
      });
    }
    if (flag === "Language") {
      dispatch({
        type: actionType.SET_LANGUAGE_FILTER,
        languageFilter: value,
      });
    }
    if (flag === "Category") {
      dispatch({
        type: actionType.SET_FILTER_TERM,
        filterTerm: value,
      });
    }
  };

  return (
    <>
      <div
        ref={buttonRef}
        className="border border-white/20 rounded-lg px-3 md:px-4 py-1.5 md:py-2 relative cursor-pointer hover:bg-white/20 hover:shadow-lg transition-all duration-200 ease-in-out bg-white/10 backdrop-blur-sm shrink-0"
      >
        <p
          className="text-sm md:text-base tracking-wide text-headingColor font-medium flex items-center gap-2 whitespace-nowrap"
          onClick={() => {
            if (!filterMenu) calculatePosition();
            setFilterMenu(!filterMenu);
          }}
        >
          {!filterName && flag}
          {filterName && (
            <>
              {filterName.length > 12
                ? `${filterName.slice(0, 12)}...`
                : filterName}
            </>
          )}

          <IoChevronDown
            className={`text-sm md:text-base text-headingColor duration-150 transition-all ease-in-out ${
              filterMenu ? "rotate-180" : "rotate-0"
            }`}
          />
        </p>
      </div>

      {filterData &&
        createPortal(
          <AnimatePresence>
            {filterMenu && (
              <motion.div
                key={`${flag}-dropdown`}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-[calc(100vw-2rem)] max-w-[240px] md:w-48 z-9999 bg-white/95 backdrop-blur-xl border border-white/60 max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 py-2 flex flex-col rounded-xl shadow-2xl fixed"
                style={{
                  top: `${dropdownPos.top}px`,
                  left: `${dropdownPos.left}px`,
                }}
              >
                {filterData?.map((data) => (
                  <div
                    key={data._id || data.id || data.name}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 hover:bg-gray-100/50 transition-colors cursor-pointer"
                    onClick={() =>
                      updateFilterButton(data.value || data.name, data.name)
                    }
                  >
                    {(flag === "Artist" || flag === "Albums") && (
                      <img
                        src={data.imageURL}
                        alt="profile pic"
                        className="w-8 min-w-[32px] h-8 rounded-full object-cover shadow-sm"
                      />
                    )}
                    <p className="w-full text-headingColor text-sm font-medium truncate">
                      {data.name.length > 15
                        ? `${data.name.slice(0, 15)}...`
                        : data.name}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

export default memo(FilterButtons);

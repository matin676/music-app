import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { IoHome } from "react-icons/io5";

import Header from "./Header";
import DashboardHome from "./DashboardHome";
import DashboardUsers from "./DashboardUsers";
import DashboardSongs from "./DashboardSongs";
import DashboardArtists from "./DashboardArtists";
import DashboardAlbums from "./DashboardAlbums";
import DashboardNewSong from "./DashboardNewSong";
import { isActiveStyles, isNotActiveStyles } from "../utils/styles";
import { useStateValue } from "../context/StateProvider";

export default function Dashboard() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-transparent">
      <Header />

      {/* Admin Navigation Tabs */}
      <div className="w-full p-2 md:p-4 flex flex-col items-center sticky top-16 md:top-20 z-40">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-1 md:p-1.5 rounded-2xl md:rounded-full shadow-lg flex flex-wrap items-center justify-center gap-2 w-full max-w-fit md:max-w-full">
          <NavLink
            to={"/dashboard/home"}
            className={({ isActive }) =>
              isActive
                ? "bg-white text-headingColor px-4 md:px-6 py-2 rounded-full shadow-md font-bold transition-all whitespace-nowrap text-sm md:text-base"
                : "text-gray-600 px-4 md:px-6 py-2 font-medium hover:text-headingColor transition-all whitespace-nowrap text-sm md:text-base"
            }
          >
            <div className="flex items-center gap-1.5 md:gap-2">
              <IoHome className="text-lg md:text-xl" />
              <span>Home</span>
            </div>
          </NavLink>

          <NavLink
            to={"/dashboard/user"}
            className={({ isActive }) =>
              isActive
                ? "bg-white text-headingColor px-4 md:px-6 py-2 rounded-full shadow-md font-bold transition-all text-sm md:text-base whitespace-nowrap"
                : "text-gray-600 px-4 md:px-6 py-2 font-medium hover:text-headingColor transition-all text-sm md:text-base whitespace-nowrap"
            }
          >
            Users
          </NavLink>

          <NavLink
            to={"/dashboard/songs"}
            className={({ isActive }) =>
              isActive
                ? "bg-white text-headingColor px-4 md:px-6 py-2 rounded-full shadow-md font-bold transition-all text-sm md:text-base whitespace-nowrap"
                : "text-gray-600 px-4 md:px-6 py-2 font-medium hover:text-headingColor transition-all text-sm md:text-base whitespace-nowrap"
            }
          >
            Songs
          </NavLink>

          <NavLink
            to={"/dashboard/artist"}
            className={({ isActive }) =>
              isActive
                ? "bg-white text-headingColor px-4 md:px-6 py-2 rounded-full shadow-md font-bold transition-all text-sm md:text-base whitespace-nowrap"
                : "text-gray-600 px-4 md:px-6 py-2 font-medium hover:text-headingColor transition-all text-sm md:text-base whitespace-nowrap"
            }
          >
            Artists
          </NavLink>

          <NavLink
            to={"/dashboard/albums"}
            className={({ isActive }) =>
              isActive
                ? "bg-white text-headingColor px-4 md:px-6 py-2 rounded-full shadow-md font-bold transition-all text-sm md:text-base whitespace-nowrap"
                : "text-gray-600 px-4 md:px-6 py-2 font-medium hover:text-headingColor transition-all text-sm md:text-base whitespace-nowrap"
            }
          >
            Albums
          </NavLink>
        </div>
      </div>

      <div className="w-full max-w-6xl p-4 flex-1">
        <Routes>
          <Route path="/home" element={<DashboardHome />} />
          <Route path="/user" element={<DashboardUsers />} />
          <Route path="/songs" element={<DashboardSongs />} />
          <Route path="/artist" element={<DashboardArtists />} />
          <Route path="/albums" element={<DashboardAlbums />} />
          <Route path="/newSong" element={<DashboardNewSong />} />
        </Routes>
      </div>
    </div>
  );
}

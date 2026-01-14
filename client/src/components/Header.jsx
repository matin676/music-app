import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaCrown } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

import { Logo } from "../assets/img";
import { isActiveStyles, isNotActiveStyles } from "../utils/styles";
import { useStateValue } from "../context/StateProvider";
import { app } from "../config/firebase.config";

export default function Header() {
  const [{ user }, dispatch] = useStateValue();
  const [isMenu, setIsMenu] = useState(false);
  const navigate = useNavigate();

  const logOut = () => {
    const firebaseAuth = getAuth(app);
    firebaseAuth
      .signOut()
      .then(() => {
        window.localStorage.setItem("auth", "false");
      })
      .catch((e) => {});
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex items-center w-full z-200 sticky top-0 py-4 px-4 md:px-8 justify-center pointer-events-none">
      {/* Floating Glass Pill */}
      <div className="w-full max-w-6xl bg-white/40 backdrop-blur-xl border border-white/40 shadow-lg rounded-2xl px-6 py-3 flex items-center justify-between pointer-events-auto transition-all duration-300">
        {/* Logo */}
        <NavLink to={"/"} className="shrink-0 flex items-center gap-2">
          <img
            src={Logo}
            alt="Logo"
            className="w-10 md:w-12 object-contain hover:scale-110 transition-transform duration-300"
          />
          <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden md:block">
            MusicApp
          </span>
        </NavLink>

        {/* Navigation */}
        <nav className="flex items-center justify-center">
          <ul className="flex items-center justify-center gap-6 md:gap-12">
            <li className="text-base md:text-lg font-medium">
              <NavLink
                to={"/home"}
                className={({ isActive }) =>
                  isActive
                    ? "text-headingColor font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-blue-500 after:rounded-full transition-all"
                    : "text-gray-600 hover:text-headingColor transition-colors"
                }
              >
                Home
              </NavLink>
            </li>
            <li className="text-base md:text-lg font-medium">
              <NavLink
                to={"/library"}
                className={({ isActive }) =>
                  isActive
                    ? "text-headingColor font-bold relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-blue-500 after:rounded-full transition-all"
                    : "text-gray-600 hover:text-headingColor transition-colors"
                }
              >
                Library
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div
          onClick={() => setIsMenu(!isMenu)}
          className="flex items-center cursor-pointer gap-3 relative p-1 rounded-full hover:bg-white/40 transition-colors"
        >
          <div className="hidden md:flex flex-col items-end">
            <p className="text-headingColor text-sm font-bold truncate max-w-[120px]">
              {user?.user?.name}
            </p>
            <p className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              Premium <FaCrown className="text-yellow-500 text-xs" />
            </p>
          </div>

          <img
            src={user?.user?.imageURL}
            className="w-10 h-10 object-cover rounded-full shadow-md border-2 border-white"
            alt="profile pic"
            referrerPolicy="no-referrer"
          />

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-50 top-14 right-0 w-64 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/60 overflow-hidden flex flex-col py-2"
                onClick={(e) => e.stopPropagation()}
              >
                <NavLink
                  to={"/userprofile"}
                  className="px-6 py-3 hover:bg-black/5 text-headingColor font-medium transition-colors border-b border-gray-100/50"
                  onClick={() => setIsMenu(false)}
                >
                  Profile
                </NavLink>
                <NavLink
                  to={"/favourite"}
                  className="px-6 py-3 hover:bg-black/5 text-headingColor font-medium transition-colors"
                  onClick={() => setIsMenu(false)}
                >
                  My Favourites
                </NavLink>

                {user?.user?.role === "admin" && (
                  <NavLink
                    to={"/dashboard/home"}
                    className="px-6 py-3 hover:bg-black/5 text-headingColor font-medium transition-colors border-t border-gray-100/50 mt-1"
                    onClick={() => setIsMenu(false)}
                  >
                    Dashboard
                  </NavLink>
                )}

                <div className="h-px bg-gray-200/50 my-1 mx-4" />
                <p
                  className="px-6 py-3 hover:bg-red-50 hover:text-red-500 text-gray-600 cursor-pointer font-medium transition-colors"
                  onClick={logOut}
                >
                  Sign Out
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

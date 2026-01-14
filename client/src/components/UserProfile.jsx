import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { MdVerified, MdCancel } from "react-icons/md";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { useData } from "../hooks/useData";

export default function UserProfile() {
  const { fetchPlaylists } = useData();
  const [{ user, favourites, playlist }, dispatch] = useStateValue();
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Fetch playlists when component mounts
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  useEffect(() => {
    // Filter user's playlists from state
    const playlistArray = playlist?.playlist || playlist || [];

    if (Array.isArray(playlistArray) && playlistArray.length > 0) {
      const myPlaylists = playlistArray.filter(
        (item) => item.user === user?.user?._id
      );
      setUserPlaylists(myPlaylists);
    } else {
      setUserPlaylists([]);
    }
  }, [playlist, user]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-transparent">
      <Header />

      <div className="flex-1 w-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white/20 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-6 overflow-hidden">
          {/* Decorative Background Blur */}
          <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/10 to-transparent" />

          {/* Profile Image */}
          <div className="relative z-10 w-32 h-32 rounded-full p-1 bg-white/30 backdrop-blur-sm shadow-xl mt-4">
            <img
              src={user?.user?.imageURL}
              className="w-full h-full object-cover rounded-full"
              alt="profile pic"
              referrerPolicy="no-referrer"
            />
            {user?.user?.email_verified && (
              <div
                className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md"
                title="Verified"
              >
                <MdVerified className="text-blue-500 text-xl" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex flex-col items-center gap-2 z-10 text-center">
            <h2 className="text-3xl font-bold text-headingColor">
              {user?.user?.name}
            </h2>
            <p className="text-gray-600 font-medium flex items-center gap-2">
              {user?.user?.email}
              {!user?.user?.email_verified && (
                <MdCancel className="text-red-500" title="Email not verified" />
              )}
            </p>
          </div>

          {/* Stats */}
          <div className="w-full grid grid-cols-3 gap-4 border-t border-b border-gray-200/20 py-4 z-10">
            <div className="flex flex-col items-center">
              <span className="font-bold text-headingColor text-lg">
                {userPlaylists.length}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Playlists
              </span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-gray-200/20">
              <span className="font-bold text-headingColor text-lg">
                {favourites?.length || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Favorited
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-headingColor text-lg capitalize">
                {user?.user?.role || "member"}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Role
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full z-10">
            <NavLink
              to={"/userprofile/editprofile"}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all font-semibold flex items-center justify-center gap-2"
            >
              Edit Profile
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}

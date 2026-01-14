import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { IoAdd } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { deleteObject, ref } from "firebase/storage";

import Header from "./Header";
import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { deletePlaylistById, getAllPlaylist } from "../api";
import { storage } from "../config/firebase.config";
import AlertSuccess from "./AlertSuccess";
import AlertError from "./AlertError";
import SEO from "./SEO";

export default function Library() {
  const [{ playlist }, dispatch] = useStateValue();

  const [isDelete, setIsDelete] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPlaylist();
        dispatch({ type: actionType.SET_ALL_PLAYLISTS, playlist: data.data });
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    if (!playlist) {
      fetchData();
    }
  }, [playlist, dispatch]);

  const deletePlaylistData = (data) => {
    const deleteRef = ref(storage, data.imageURL);
    deleteObject(deleteRef).then(() => {});

    deletePlaylistById(data._id)
      .then((res) => {
        if (res && res.data && res.data.success) {
          getAllPlaylist().then((data) => {
            dispatch({
              type: actionType.SET_ALL_PLAYLISTS,
              playlist: data.data,
            });
          });
          setAlert("success");
          setAlertMsg("Playlist removed successfully");
          setTimeout(() => {
            setAlert(null);
          }, 4000);
        } else {
          setAlert("error");
          setAlertMsg("Error removing playlist");
          setTimeout(() => {
            setAlert(null);
          }, 4000);
        }
      })
      .catch((error) => {
        console.error("Error deleting playlist:", error.message);
      });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-transparent">
      <SEO
        title="My Library"
        description="View and manage your personal music playlists and collections."
      />
      <Header />

      <main className="w-full p-3 md:p-4 flex flex-col items-center max-w-[1200px]">
        {/* Page Header */}
        <div className="w-full flex items-center justify-between mb-4 md:mb-6 px-2">
          <h2 className="text-xl md:text-2xl font-bold text-headingColor">
            My Library
          </h2>

          <NavLink
            to={"/library/newPlaylist"}
            className="px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-all flex items-center gap-1.5 md:gap-2 group text-sm md:text-base"
          >
            <IoAdd className="text-lg md:text-xl group-hover:rotate-90 transition-transform" />
            <span className="font-semibold hidden sm:inline">Create New</span>
            <span className="font-semibold sm:hidden">New</span>
          </NavLink>
        </div>

        {/* Playlist Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {/* Add New Card (Alternative access) */}
          <NavLink
            to={"/library/newPlaylist"}
            className="w-full aspect-[4/5] border-2 border-dashed border-gray-400/50 rounded-xl md:rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/20 transition-all group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200/50 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <IoAdd className="text-xl md:text-2xl text-gray-500 group-hover:text-white" />
            </div>
            <p className="mt-2 text-xs md:text-sm font-semibold text-gray-500 group-hover:text-blue-500 px-2 text-center">
              <span className="hidden sm:inline">Create New Playlist</span>
              <span className="sm:hidden">New Playlist</span>
            </p>
          </NavLink>

          {playlist &&
            playlist.map((data) => (
              <div
                key={data._id}
                className="relative w-full aspect-[4/5] bg-white/20 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                {/* Delete Overlay - Only renders when isDelete is active for this SPECIFIC item */}
                {/* 
                     Issue: `isDelete` state was global boolean. 
                     Fix: We need a local state or a way to identify which card is being deleted. 
                     For simplicity in this refactor, let's use a standard window.confirm or a smarter overlay.
                     For now, let's use the local state with ID.
                 */}
                {isDelete === data._id && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fadeIn">
                    <p className="text-white font-bold mb-3">
                      Delete this playlist?
                    </p>
                    <div className="flex gap-3">
                      <button
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                        onClick={() => deletePlaylistData(data)}
                      >
                        Delete
                      </button>
                      <button
                        className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                        onClick={() => setIsDelete(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <NavLink
                  to={`/library/playlistSongs/${data._id}`}
                  className="w-full h-full flex flex-col"
                >
                  {/* Image Section */}
                  <div className="w-full aspect-square overflow-hidden relative">
                    <img
                      src={data.imageURL}
                      alt={data.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Song Count Badge */}
                    <span className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs font-medium">
                      {data.songs.length} Songs
                    </span>
                  </div>

                  {/* Details Section */}
                  <div className="p-2 md:p-3 flex items-center justify-between flex-1 bg-white/30 backdrop-blur-sm">
                    <p
                      className="text-headingColor font-bold text-xs md:text-sm truncate pr-2"
                      title={data.name}
                    >
                      {data.name}
                    </p>

                    <button
                      className="p-1.5 md:p-2 hover:bg-red-100 rounded-full text-gray-500 hover:text-red-500 transition-colors z-10 shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDelete(data._id); // Set ID instead of boolean
                      }}
                    >
                      <MdDelete className="text-base md:text-lg" />
                    </button>
                  </div>
                </NavLink>
              </div>
            ))}
        </div>

        {alert && (
          <>
            {alert === "success" ? (
              <AlertSuccess msg={alertMsg} />
            ) : (
              <AlertError msg={alertMsg} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

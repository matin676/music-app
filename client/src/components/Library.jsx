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

export default function Library() {
  const [{ playlist }, dispatch] = useStateValue();

  const [isDelete, setIsDelete] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllPlaylist();
        dispatch({ type: actionType.SET_ALL_PLAYLISTS, playlist: data });
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
              allPlaylist: data.playlist,
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
    <div className="w-full h-auto flex flex-col items-center justify-center bg-primary">
      <Header />
      <h1 className="text-2xl font-semibold mb-4">Library</h1>
      <div className="w-full flex justify-center items-center gap-24">
        <NavLink
          to={"/library/newPlaylist"}
          className="flex items-center justify-center px-4 py-3 border rounded-md border-gray-300 hover:border-gray-500 hover:shadow-md cursor-pointer"
        >
          <IoAdd />
        </NavLink>
        <p className="w-52 px-4 py-2 border border-gray-500 shadow-md rounded-md bg-transparent outline-none duration-150 transition-all ease-in-out text-base text-textColor font-semibold">
          Your Playlists
        </p>
      </div>
      <div className="flex flex-col my-2 w-80 relative top-5">
        {playlist &&
          playlist.map((data) => (
            <NavLink to={`/library/playlistSongs/${data._id}`} key={data._id}>
              <div className="my-2 hover:shadow-xl hover:bg-card rounded-xl">
                <div className="flex">
                  <img
                    src={data.imageURL}
                    alt=""
                    className="rounded-xl object-cover w-20 h-20"
                  />
                  <p className="px-4 py-2 text-base text-textColor font-semibold">
                    {data.name} <br />
                    <span className="py-2 text-base text-darkOverlay">
                      Songs: {data.songs.length}
                    </span>
                  </p>
                  <i>
                    <MdDelete
                      className="my-2 text-xl text-red-500 hover:cursor-pointer hover:scale-[1.2] transition-all ease-in-out relative"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsDelete(true);
                      }}
                    />
                  </i>
                  {isDelete && (
                    <div className="absolute inset-0 backdrop-blur-sm bg-cardOverlay flex items-center justify-center flex-col px-4 py-2 gap-0">
                      <p className="text-lg text-headingColor font-semibold text-center">
                        Are you sure do you want to delete it?
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          className="px-2 py-1 text-sm uppercase bg-green-300 rounded-md hover:bg-green-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            deletePlaylistData(data);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className="px-2 py-1 text-sm uppercase bg-red-300 rounded-md hover:bg-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsDelete(false);
                          }}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </NavLink>
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
    </div>
  );
}

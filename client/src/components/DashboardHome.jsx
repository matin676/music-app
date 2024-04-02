import React, { useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { GiLoveSong, GiMusicalNotes } from "react-icons/gi";
import { RiUserStarFill } from "react-icons/ri";

import { useStateValue } from "../context/StateProvider";
import { actionType } from "../context/reducer";
import { getAllAlbums, getAllArtists, getAllSongs, getAllUsers } from "../api";
import { bgColors } from "../utils/styles";

export const DashboardCard = ({ icon, name, count }) => {
  const bg_Color = bgColors[parseInt(Math.random() * bgColors.length)];

  return (
    <div
      style={{ background: `${bg_Color}` }}
      className="p-4 w-40 gap-3 h-auto rounded-lg shadow-md flex flex-col justify-center items-center"
    >
      {icon}
      <p className="text-xl font-semibold text-textColor">{name}</p>
      <p className="text-xl  text-textColor">{count}</p>
    </div>
  );
};

export default function DashboardHome() {
  const [{ allUsers, allSongs, allAlbums, allArtists }, dispatch] =
    useStateValue();

  useEffect(() => {
    if (!allUsers) {
      getAllUsers().then((data) => {
        dispatch({
          type: actionType.SET_ALL_USERS,
          allUsers: data.user,
        });
      });
    }

    if (!allArtists) {
      getAllArtists().then((data) => {
        dispatch({
          type: actionType.SET_ALL_ARTISTS,
          allArtists: data.artist,
        });
      });
    }

    if (!allAlbums) {
      getAllAlbums().then((data) => {
        dispatch({
          type: actionType.SET_ALL_ALBUMS,
          allAlbums: data.album,
        });
      });
    }

    if (!allSongs) {
      getAllSongs().then((data) => {
        dispatch({
          type: actionType.SET_ALL_SONGS,
          allSongs: data.song,
        });
      });
    }
  }, []);

  return (
    <div className="w-full p-6 flex items-center justify-evenly flex-wrap">
      <DashboardCard
        icon={<FaUsers className="text-3xl text-textColor" />}
        name={"Users"}
        count={allUsers?.length > 0 ? allUsers?.length : 0}
      />
      <DashboardCard
        icon={<GiLoveSong className="text-3xl text-textColor" />}
        name={"Songs"}
        count={allSongs?.length > 0 ? allSongs?.length : 0}
      />
      <DashboardCard
        icon={<RiUserStarFill className="text-3xl text-textColor" />}
        name={"Artists"}
        count={allArtists?.length > 0 ? allArtists?.length : 0}
      />
      <DashboardCard
        icon={<GiMusicalNotes className="text-3xl text-textColor" />}
        name={"Albums"}
        count={allAlbums?.length > 0 ? allAlbums?.length : 0}
      />
    </div>
  );
}

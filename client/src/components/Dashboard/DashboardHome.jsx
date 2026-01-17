import React, { useEffect } from "react";
import { FaUsers } from "react-icons/fa";
import { GiLoveSong, GiMusicalNotes } from "react-icons/gi";
import { RiUserStarFill } from "react-icons/ri";

import { useStateValue } from "../../context/StateProvider";
import { actionType } from "../../context/reducer";
import { useData } from "../../hooks/useData";
import { bgColors } from "../../utils/styles";

export const DashboardCard = ({ icon, name, count, iconColor, hoverColor }) => {
  return (
    <div
      className={`p-6 w-full h-auto bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group overflow-hidden relative`}
    >
      <div className="flex flex-col gap-1 z-10">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {name}
        </p>
        <p className="text-3xl font-extrabold text-headingColor">{count}</p>
      </div>

      <div
        className={`w-14 h-14 rounded-full ${iconColor} bg-opacity-20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm z-10`}
      >
        {icon}
      </div>

      {/* Subtle Hover Effect Background */}
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${hoverColor} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-300`}
      />
    </div>
  );
};

export default function DashboardHome() {
  const { fetchSongs, fetchArtists, fetchAlbums, fetchUsers } = useData();
  const [{ allUsers, allSongs, allAlbums, allArtists }, dispatch] =
    useStateValue();

  useEffect(() => {
    fetchUsers();
    fetchArtists();
    fetchAlbums();
    fetchSongs();
  }, [fetchUsers, fetchArtists, fetchAlbums, fetchSongs]);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      <DashboardCard
        icon={<FaUsers className="text-blue-600" />}
        name={"Users"}
        count={allUsers?.length > 0 ? allUsers?.length : 0}
        iconColor="bg-blue-100"
        hoverColor="bg-blue-500"
      />
      <DashboardCard
        icon={<GiLoveSong className="text-pink-600" />}
        name={"Songs"}
        count={allSongs?.length > 0 ? allSongs?.length : 0}
        iconColor="bg-pink-100"
        hoverColor="bg-pink-500"
      />
      <DashboardCard
        icon={<RiUserStarFill className="text-emerald-600" />}
        name={"Artists"}
        count={allArtists?.length > 0 ? allArtists?.length : 0}
        iconColor="bg-emerald-100"
        hoverColor="bg-emerald-500"
      />
      <DashboardCard
        icon={<GiMusicalNotes className="text-orange-600" />}
        name={"Albums"}
        count={allAlbums?.length > 0 ? allAlbums?.length : 0}
        iconColor="bg-orange-100"
        hoverColor="bg-orange-500"
      />
    </div>
  );
}

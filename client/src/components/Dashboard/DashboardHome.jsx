/**
 * DashboardHome Component
 *
 * Dashboard overview showing counts of users, songs, artists, albums.
 * Now uses React Query hooks for data fetching with automatic caching.
 */
import React from "react";
import { FaUsers } from "react-icons/fa";
import { GiLoveSong, GiMusicalNotes } from "react-icons/gi";
import { RiUserStarFill } from "react-icons/ri";

import { useSongs, useArtists, useAlbums } from "../../features/library/hooks";
import { useUsers } from "../../features/admin/hooks";

export const DashboardCard = ({
  icon,
  name,
  count,
  iconColor,
  hoverColor,
  isLoading,
}) => {
  return (
    <div
      className={`p-6 w-full h-auto bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group overflow-hidden relative`}
    >
      <div className="flex flex-col gap-1 z-10">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          {name}
        </p>
        {isLoading ? (
          <div className="h-9 w-16 bg-gray-200 animate-pulse rounded-md" />
        ) : (
          <p className="text-3xl font-extrabold text-headingColor">{count}</p>
        )}
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
  // Using React Query hooks - data is automatically cached and refetched
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: songs, isLoading: songsLoading } = useSongs();
  const { data: artists, isLoading: artistsLoading } = useArtists();
  const { data: albums, isLoading: albumsLoading } = useAlbums();

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
      <DashboardCard
        icon={<FaUsers className="text-blue-600" />}
        name={"Users"}
        count={users?.length || 0}
        iconColor="bg-blue-100"
        hoverColor="bg-blue-500"
        isLoading={usersLoading}
      />
      <DashboardCard
        icon={<GiLoveSong className="text-pink-600" />}
        name={"Songs"}
        count={songs?.length || 0}
        iconColor="bg-pink-100"
        hoverColor="bg-pink-500"
        isLoading={songsLoading}
      />
      <DashboardCard
        icon={<RiUserStarFill className="text-emerald-600" />}
        name={"Artists"}
        count={artists?.length || 0}
        iconColor="bg-emerald-100"
        hoverColor="bg-emerald-500"
        isLoading={artistsLoading}
      />
      <DashboardCard
        icon={<GiMusicalNotes className="text-orange-600" />}
        name={"Albums"}
        count={albums?.length || 0}
        iconColor="bg-orange-100"
        hoverColor="bg-orange-500"
        isLoading={albumsLoading}
      />
    </div>
  );
}

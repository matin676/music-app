import React from "react";
import { useStats } from "../../features/library/hooks";
import {
  MdOutlineLibraryMusic,
  MdOutlineCategory,
  MdMicExternalOn,
  MdLanguage,
} from "react-icons/md";

const StatCard = ({ title, count, icon, color }) => (
  <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/50 w-full">
    <div className={`p-3 rounded-full ${color} text-white text-xl`}>{icon}</div>
    <div className="flex flex-col">
      <span className="text-gray-500 text-xs font-bold uppercase tracking-wide">
        {title}
      </span>
      <span className="text-2xl font-extrabold text-headingColor">
        {count || 0}
      </span>
    </div>
  </div>
);

const DistributionItem = ({ label, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-gray-600 truncate max-w-[120px]" title={label}>
          {label}
        </span>
        <span className="text-gray-800">{count}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function DashboardStats() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="w-full h-40 bg-gray-200 animate-pulse rounded-xl"></div>
    );
  }

  if (!stats) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Cards for Specific Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Songs"
          count={stats.totalSongs?.[0]?.count}
          icon={<MdOutlineLibraryMusic />}
          color="bg-blue-500"
        />
        <StatCard
          title="Categories"
          count={stats.songsByCategory?.length}
          icon={<MdOutlineCategory />}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Artists"
          count={stats.songsByArtist?.length}
          icon={<MdMicExternalOn />}
          color="bg-teal-500"
        />
        <StatCard
          title="Languages"
          count={stats.songsByLanguage?.length}
          icon={<MdLanguage />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-headingColor">
            Songs by Category
          </h3>
          <div className="flex flex-col gap-3">
            {stats.songsByCategory?.map((cat) => (
              <DistributionItem
                key={cat._id}
                label={cat._id}
                count={cat.count}
                total={stats.totalSongs?.[0]?.count}
              />
            ))}
          </div>
        </div>

        {/* Artist Distribution */}
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-xl p-6 shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-headingColor">Top Artists</h3>
          <div className="flex flex-col gap-3">
            {stats.songsByArtist?.map((artist) => (
              <DistributionItem
                key={artist._id}
                label={artist._id}
                count={artist.count}
                total={stats.totalSongs?.[0]?.count}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * Skeleton Component
 * Modern, clean loading placeholder using Tailwind CSS
 */
const Skeleton = ({ variant = "rect", className = "", width, height }) => {
  const baseClasses = "bg-gray-200 animate-pulse";

  const variantClasses = {
    rect: "rounded-lg",
    circle: "rounded-full",
    text: "rounded h-4",
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ""} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

Skeleton.propTypes = {
  variant: PropTypes.oneOf(["rect", "circle", "text"]),
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

/**
 * Modern Song Card Skeleton
 * Matches the layout of the actual SongCard
 */
export const SongCardSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 w-[180px] shadow-sm">
    <Skeleton
      variant="rect"
      className="w-full aspect-square rounded-xl shadow-inner"
    />
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" className="w-3/4 h-4" />
      <Skeleton variant="text" className="w-1/2 h-3" />
    </div>
  </div>
);

/**
 * Modern Song Row Skeleton
 * Matches the layout of DashboardSongs rows
 */
export const SongRowSkeleton = () => (
  <div className="w-full grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-4 p-3 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 items-center">
    {/* Image */}
    <Skeleton variant="rect" className="w-12 h-12 rounded-lg md:rounded-xl" />

    {/* Name & Artist */}
    <div className="flex flex-col gap-2 min-w-0">
      <Skeleton variant="text" className="w-32 h-4" />
      <Skeleton variant="text" className="w-20 h-3" />
    </div>

    {/* Album & Category (Desktop) */}
    <div className="hidden md:flex flex-col gap-2 min-w-0">
      <Skeleton variant="text" className="w-24 h-3" />
      <div className="flex gap-1">
        <Skeleton variant="rect" className="w-12 h-5 rounded" />
        <Skeleton variant="rect" className="w-12 h-5 rounded" />
      </div>
    </div>

    {/* Duration */}
    <Skeleton variant="text" className="hidden sm:block w-10 h-3" />

    {/* Actions */}
    <div className="flex gap-2">
      <Skeleton variant="circle" className="w-8 h-8" />
      <Skeleton variant="circle" className="w-8 h-8" />
    </div>
  </div>
);

/**
 * Hero Skeleton
 */
export const HeroSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-8 p-8 bg-linear-to-br from-white/40 to-white/10 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl">
    <Skeleton
      variant="rect"
      className="w-full md:w-[200px] h-[200px] rounded-2xl shadow-lg"
    />
    <div className="flex-1 flex flex-col justify-center gap-4">
      <Skeleton variant="text" className="w-3/4 h-8 md:h-10 rounded-lg" />
      <Skeleton variant="text" className="w-1/2 h-5 rounded-md" />
      <Skeleton variant="rect" className="w-36 h-12 rounded-full mt-2" />
    </div>
  </div>
);

export default Skeleton;

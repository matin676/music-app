/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation
 * Used for content placeholders during data fetching
 */
import PropTypes from "prop-types";
import "./Skeleton.css";

const Skeleton = ({ variant = "rect", className = "", width, height }) => {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
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
 * Pre-built skeleton patterns for common use cases
 */
export const SongCardSkeleton = () => (
  <div className="skeleton-song-card">
    <Skeleton variant="rect" className="skeleton-song-image" />
    <div className="skeleton-song-info">
      <Skeleton variant="text" className="skeleton-song-title" />
      <Skeleton variant="text" className="skeleton-song-artist" />
    </div>
  </div>
);

export const SongRowSkeleton = () => (
  <div className="skeleton-song-row">
    <Skeleton variant="rect" className="skeleton-row-image" />
    <div className="skeleton-row-info">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </div>
    <Skeleton variant="text" width="60px" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="skeleton-hero">
    <Skeleton variant="rect" className="skeleton-hero-image" />
    <div className="skeleton-hero-content">
      <Skeleton variant="text" className="skeleton-hero-title" />
      <Skeleton variant="text" className="skeleton-hero-subtitle" />
      <Skeleton variant="rect" className="skeleton-hero-button" />
    </div>
  </div>
);

export default Skeleton;

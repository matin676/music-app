/**
 * Loading Component
 *
 * A reusable loading spinner/indicator for async operations
 */
import PropTypes from "prop-types";
import "./Loading.css";

const Loading = ({ size = "md", text = "", fullScreen = false }) => {
  const sizeClasses = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
  };

  return (
    <div className={`loading ${fullScreen ? "loading-fullscreen" : ""}`}>
      <div className={`loading-spinner ${sizeClasses[size]}`}>
        <div className="loading-spinner-ring"></div>
        <div className="loading-spinner-ring"></div>
        <div className="loading-spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

Loading.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  text: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loading;

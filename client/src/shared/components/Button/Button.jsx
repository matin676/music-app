/**
 * Button Component
 *
 * Reusable button with multiple variants and sizes
 * Uses design tokens for consistent styling
 */
import { forwardRef } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import "./Button.css";

const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      children,
      className = "",
      isLoading = false,
      leftIcon = null,
      rightIcon = null,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileHover={!isDisabled ? { scale: 1.02 } : undefined}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        className={`btn btn-${variant} btn-${size} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <span className="btn-spinner" aria-hidden="true">
            <svg className="animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        )}
        {!isLoading && leftIcon && (
          <span className="btn-icon btn-icon-left">{leftIcon}</span>
        )}
        <span className="btn-text">{children}</span>
        {!isLoading && rightIcon && (
          <span className="btn-icon btn-icon-right">{rightIcon}</span>
        )}
      </motion.button>
    );
  },
);

Button.displayName = "Button";

Button.propTypes = {
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "ghost",
    "danger",
    "success",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  disabled: PropTypes.bool,
};

export default Button;

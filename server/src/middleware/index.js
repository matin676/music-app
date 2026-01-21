/**
 * Middleware Index
 * Central export for all middleware functions
 */

const { authenticate, optionalAuth } = require("./auth");
const { requireAdmin, attachDbUser } = require("./admin");
const { errorHandler, asyncHandler, ApiError } = require("./errorHandler");

module.exports = {
  // Authentication
  authenticate,
  optionalAuth,

  // Authorization
  requireAdmin,
  attachDbUser,

  // Error Handling
  errorHandler,
  asyncHandler,
  ApiError,
};

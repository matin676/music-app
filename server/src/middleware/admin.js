/**
 * Admin Authorization Middleware
 * Requires authenticated request (use after auth middleware)
 * Checks if the authenticated user has admin role in the database
 *
 * USAGE: router.delete("/song/:id", authenticate, requireAdmin, deleteHandler);
 */
const User = require("../../models/user");

/**
 * Middleware to require admin role for protected admin-only routes
 * MUST be used AFTER authenticate middleware
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requireAdmin = async (req, res, next) => {
  // Ensure authenticate middleware ran first
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error:
        "No user context found - ensure authenticate middleware is applied first",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Fetch user from database to check role
    const dbUser = await User.findOne({ user_id: req.user.user_id }).lean();

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        error: "No user record exists for this account",
        timestamp: new Date().toISOString(),
      });
    }

    if (dbUser.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        error: "You do not have permission to perform this action",
        timestamp: new Date().toISOString(),
      });
    }

    // Attach full database user to request for use in handlers
    req.dbUser = dbUser;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization check failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Middleware to attach database user to request (for any authenticated user)
 * Useful when you need the full user record, not just token data
 */
const attachDbUser = async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  try {
    const dbUser = await User.findOne({ user_id: req.user.user_id }).lean();
    if (dbUser) {
      req.dbUser = dbUser;
    }
  } catch {
    // Silently continue - dbUser just won't be available
  }

  next();
};

module.exports = { requireAdmin, attachDbUser };

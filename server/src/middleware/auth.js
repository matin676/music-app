/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and attaches user data to request
 *
 * SECURITY: This middleware MUST be applied to all protected routes.
 * It decodes the Firebase token and looks up the user in MongoDB to
 * attach both Firebase data and the MongoDB _id to req.user.
 */
const admin = require("../../config/firebase.config");
const User = require("../../models/user");

/**
 * Middleware to authenticate requests using Firebase ID tokens
 * Also looks up the user in MongoDB and attaches the _id
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      error: "Missing or malformed authorization header",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Look up user in MongoDB to get the _id
    const dbUser = await User.findOne({ user_id: decodedToken.user_id }).lean();

    // Attach decoded user info to request
    req.user = {
      uid: decodedToken.uid,
      user_id: decodedToken.user_id,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      email_verified: decodedToken.email_verified,
      // Add MongoDB _id (as string for comparison with playlist.user)
      _id: dbUser?._id?.toString() || null,
      role: dbUser?.role || "member",
    };

    next();
  } catch (error) {
    // Handle specific Firebase auth errors
    const errorMessages = {
      "auth/id-token-expired": "Token has expired. Please sign in again.",
      "auth/id-token-revoked": "Token has been revoked. Please sign in again.",
      "auth/argument-error": "Invalid token format.",
    };

    const message = errorMessages[error.code] || "Invalid authentication token";

    return res.status(401).json({
      success: false,
      message,
      error: error.code || "auth/invalid-token",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, just doesn't set req.user
 * Useful for routes that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(); // Continue without user
  }

  try {
    const token = authHeader.split(" ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Look up user in MongoDB
    const dbUser = await User.findOne({ user_id: decodedToken.user_id }).lean();

    req.user = {
      uid: decodedToken.uid,
      user_id: decodedToken.user_id,
      email: decodedToken.email,
      name: decodedToken.name,
      _id: dbUser?._id?.toString() || null,
      role: dbUser?.role || "member",
    };
  } catch {
    // Silently continue without user for optional auth
  }

  next();
};

module.exports = { authenticate, optionalAuth };

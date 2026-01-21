/**
 * User Authentication Routes
 *
 * PUBLIC: GET /login (with token)
 * AUTHENTICATED: PUT /updateuser/:userId, PUT /updateFavourites/:userId
 * ADMIN ONLY: GET /getusers, PUT /updaterole/:userId, DELETE /deleteuser/:userId
 */
const router = require("express").Router();
const admin = require("../config/firebase.config");
const User = require("../models/user");
const ApiResponse = require("../src/utils/apiResponse");
const {
  authenticate,
  requireAdmin,
  asyncHandler,
} = require("../src/middleware");

/**
 * @route   GET /api/users/login
 * @desc    Validate Firebase token and login/register user
 * @access  Public (but requires valid Firebase token)
 */
router.get(
  "/login",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return ApiResponse.unauthorized(res, "Invalid or missing token");
    }

    const token = authHeader.split(" ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Check if user exists
      let user = await User.findOne({ user_id: decodedToken.user_id });

      if (!user) {
        // Create new user
        user = await User.create({
          name: decodedToken.name,
          email: decodedToken.email,
          imageURL: decodedToken.picture,
          user_id: decodedToken.user_id,
          email_verified: decodedToken.email_verified,
          role: "member",
          auth_time: decodedToken.auth_time,
        });

        return ApiResponse.created(
          res,
          { user },
          "User registered successfully",
        );
      }

      // Update auth_time for existing user
      user = await User.findOneAndUpdate(
        { user_id: decodedToken.user_id },
        { auth_time: decodedToken.auth_time },
        { new: true },
      );

      return ApiResponse.success(res, { user }, "Login successful");
    } catch (error) {
      return ApiResponse.unauthorized(res, "Invalid token");
    }
  }),
);

/**
 * @route   GET /api/users/getusers
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  "/getusers",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, users, "Users retrieved successfully");
  }),
);

/**
 * @route   PUT /api/users/updaterole/:userId
 * @desc    Update a user's role (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/updaterole/:userId",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { role } = req.body.data || req.body;

    if (!role || !["member", "admin"].includes(role)) {
      return ApiResponse.validationError(
        res,
        null,
        "Invalid role. Must be 'member' or 'admin'",
      );
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true },
    );

    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, { user }, "User role updated successfully");
  }),
);

/**
 * @route   DELETE /api/users/deleteuser/:userId
 * @desc    Delete a user (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/deleteuser/:userId",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    // Prevent self-deletion
    if (req.dbUser._id.toString() === req.params.userId) {
      return ApiResponse.error(res, "Cannot delete your own account", 400);
    }

    const result = await User.findByIdAndDelete(req.params.userId);

    if (!result) {
      return ApiResponse.notFound(res, "User not found");
    }

    return ApiResponse.success(res, null, "User deleted successfully");
  }),
);

/**
 * @route   PUT /api/users/updateuser/:userId
 * @desc    Update user profile (owner or admin)
 * @access  Private
 */
router.put(
  "/updateuser/:userId",
  authenticate,
  asyncHandler(async (req, res) => {
    // Check if user is updating own profile or is admin (compare MongoDB _id)
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return ApiResponse.notFound(res, "User not found");
    }

    const isOwner = targetUser._id.toString() === req.user._id;
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return ApiResponse.forbidden(res, "You can only update your own profile");
    }

    const { name, email, imageURL } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email, imageURL },
      { new: true, runValidators: true },
    );

    return ApiResponse.success(
      res,
      { user: updatedUser },
      "Profile updated successfully",
    );
  }),
);

/**
 * @route   PUT /api/users/updateFavourites/:userId
 * @desc    Toggle a song in user's favourites
 * @access  Private
 */
router.put(
  "/updateFavourites/:userId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { songId } = req.body;

    if (!songId) {
      return ApiResponse.validationError(res, null, "Song ID is required");
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return ApiResponse.notFound(res, "User not found");
    }

    // Check if user is updating own favourites (compare MongoDB _id)
    if (user._id.toString() !== req.user._id) {
      return ApiResponse.forbidden(
        res,
        "You can only update your own favourites",
      );
    }

    const favourites = user.favourites || [];
    const isPresent = favourites.includes(songId);

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      isPresent
        ? { $pull: { favourites: songId } }
        : { $addToSet: { favourites: songId } },
      { new: true },
    );

    const action = isPresent ? "removed from" : "added to";
    return ApiResponse.success(
      res,
      { user: updatedUser },
      `Song ${action} favourites`,
    );
  }),
);

module.exports = router;

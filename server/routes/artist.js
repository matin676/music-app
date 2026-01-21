/**
 * Artist Routes
 *
 * PUBLIC: GET /getall, GET /getone/:id
 * ADMIN ONLY: POST /save, PUT /update/:id, DELETE /delete/:id
 */
const router = require("express").Router();
const Artist = require("../models/artist");
const Song = require("../models/song");
const ApiResponse = require("../src/utils/apiResponse");
const {
  authenticate,
  requireAdmin,
  asyncHandler,
} = require("../src/middleware");

/**
 * @route   POST /api/artists/save
 * @desc    Create a new artist (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/save",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL, twitter, instagram } = req.body;

    if (!name) {
      return ApiResponse.validationError(res, null, "Artist name is required");
    }

    const newArtist = new Artist({ name, imageURL, twitter, instagram });
    const savedArtist = await newArtist.save();

    return ApiResponse.created(res, savedArtist, "Artist created successfully");
  }),
);

/**
 * @route   GET /api/artists/getone/:id
 * @desc    Get a single artist by ID
 * @access  Public
 */
router.get(
  "/getone/:id",
  asyncHandler(async (req, res) => {
    const artist = await Artist.findById(req.params.id).lean();

    if (!artist) {
      return ApiResponse.notFound(res, "Artist not found");
    }

    return ApiResponse.success(res, artist, "Artist retrieved successfully");
  }),
);

/**
 * @route   GET /api/artists/getall
 * @desc    Get all artists
 * @access  Public
 */
router.get(
  "/getall",
  asyncHandler(async (req, res) => {
    const artists = await Artist.find().sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, artists, "Artists retrieved successfully");
  }),
);

/**
 * @route   PUT /api/artists/update/:id
 * @desc    Update an artist (Admin only) - Also updates artist name in all songs
 * @access  Private/Admin
 */
router.put(
  "/update/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL, twitter, instagram } = req.body;

    // Get old artist to check for name change
    const oldArtist = await Artist.findById(req.params.id);
    if (!oldArtist) {
      return ApiResponse.notFound(res, "Artist not found");
    }

    const oldName = oldArtist.name;

    // Update the artist
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { name, imageURL, twitter, instagram },
      { new: true, runValidators: true },
    );

    // If name changed, update all songs referencing this artist
    if (name && oldName !== name) {
      await Song.updateMany(
        { artist: oldName },
        { $set: { "artist.$[elem]": name } },
        { arrayFilters: [{ elem: oldName }] },
      );
    }

    return ApiResponse.success(res, artist, "Artist updated successfully");
  }),
);

/**
 * @route   DELETE /api/artists/delete/:id
 * @desc    Delete an artist (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/delete/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await Artist.findByIdAndDelete(req.params.id);

    if (!result) {
      return ApiResponse.notFound(res, "Artist not found");
    }

    return ApiResponse.success(res, null, "Artist deleted successfully");
  }),
);

module.exports = router;

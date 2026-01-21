/**
 * Songs Routes
 *
 * PUBLIC: GET /getall, GET /getone/:id
 * ADMIN ONLY: POST /save, PUT /update/:id, DELETE /delete/:id
 */
const router = require("express").Router();
const Song = require("../models/song");
const ApiResponse = require("../src/utils/apiResponse");
const {
  authenticate,
  requireAdmin,
  asyncHandler,
} = require("../src/middleware");

/**
 * @route   POST /api/songs/save
 * @desc    Create a new song (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/save",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL, songURL, album, artist, language, category } =
      req.body;

    // Basic validation
    if (!name || !imageURL || !songURL || !artist || !language || !category) {
      return ApiResponse.validationError(res, null, "Missing required fields");
    }

    const newSong = new Song({
      name,
      imageURL,
      songURL,
      album,
      artist,
      language,
      category,
    });

    const savedSong = await newSong.save();
    return ApiResponse.created(res, savedSong, "Song created successfully");
  }),
);

/**
 * @route   GET /api/songs/getone/:id
 * @desc    Get a single song by ID
 * @access  Public
 */
router.get(
  "/getone/:id",
  asyncHandler(async (req, res) => {
    const song = await Song.findById(req.params.id).lean();

    if (!song) {
      return ApiResponse.notFound(res, "Song not found");
    }

    return ApiResponse.success(res, song, "Song retrieved successfully");
  }),
);

/**
 * @route   GET /api/songs/getall
 * @desc    Get all songs
 * @access  Public
 */
router.get(
  "/getall",
  asyncHandler(async (req, res) => {
    const songs = await Song.find().sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, songs, "Songs retrieved successfully");
  }),
);

/**
 * @route   PUT /api/songs/update/:id
 * @desc    Update a song (Admin only)
 * @access  Private/Admin
 */
router.put(
  "/update/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL, songURL, album, artist, language, category } =
      req.body;

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { name, imageURL, songURL, album, artist, language, category },
      { new: true, runValidators: true },
    );

    if (!song) {
      return ApiResponse.notFound(res, "Song not found");
    }

    return ApiResponse.success(res, song, "Song updated successfully");
  }),
);

/**
 * @route   DELETE /api/songs/delete/:id
 * @desc    Delete a song (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/delete/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await Song.findByIdAndDelete(req.params.id);

    if (!result) {
      return ApiResponse.notFound(res, "Song not found");
    }

    return ApiResponse.success(res, null, "Song deleted successfully");
  }),
);

module.exports = router;

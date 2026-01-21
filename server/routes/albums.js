/**
 * Album Routes
 *
 * PUBLIC: GET /getall, GET /getone/:id
 * ADMIN ONLY: POST /save, PUT /update/:id, DELETE /delete/:id
 */
const router = require("express").Router();
const Album = require("../models/album");
const Song = require("../models/song");
const ApiResponse = require("../src/utils/apiResponse");
const {
  authenticate,
  requireAdmin,
  asyncHandler,
} = require("../src/middleware");

/**
 * @route   POST /api/albums/save
 * @desc    Create a new album (Admin only)
 * @access  Private/Admin
 */
router.post(
  "/save",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL } = req.body;

    if (!name) {
      return ApiResponse.validationError(res, null, "Album name is required");
    }

    const newAlbum = new Album({ name, imageURL });
    const savedAlbum = await newAlbum.save();

    return ApiResponse.created(res, savedAlbum, "Album created successfully");
  }),
);

/**
 * @route   GET /api/albums/getone/:id
 * @desc    Get a single album by ID
 * @access  Public
 */
router.get(
  "/getone/:id",
  asyncHandler(async (req, res) => {
    const album = await Album.findById(req.params.id).lean();

    if (!album) {
      return ApiResponse.notFound(res, "Album not found");
    }

    return ApiResponse.success(res, album, "Album retrieved successfully");
  }),
);

/**
 * @route   GET /api/albums/getall
 * @desc    Get all albums
 * @access  Public
 */
router.get(
  "/getall",
  asyncHandler(async (req, res) => {
    const albums = await Album.find().sort({ createdAt: -1 }).lean();
    return ApiResponse.success(res, albums, "Albums retrieved successfully");
  }),
);

/**
 * @route   PUT /api/albums/update/:id
 * @desc    Update an album (Admin only) - Also updates album name in all songs
 * @access  Private/Admin
 */
router.put(
  "/update/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name, imageURL } = req.body;

    // Get old album to check for name change
    const oldAlbum = await Album.findById(req.params.id);
    if (!oldAlbum) {
      return ApiResponse.notFound(res, "Album not found");
    }

    const oldName = oldAlbum.name;

    // Update the album
    const album = await Album.findByIdAndUpdate(
      req.params.id,
      { name, imageURL },
      { new: true, runValidators: true },
    );

    // If name changed, update all songs referencing this album
    if (name && oldName !== name) {
      await Song.updateMany({ album: oldName }, { $set: { album: name } });
    }

    return ApiResponse.success(res, album, "Album updated successfully");
  }),
);

/**
 * @route   DELETE /api/albums/delete/:id
 * @desc    Delete an album (Admin only)
 * @access  Private/Admin
 */
router.delete(
  "/delete/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const result = await Album.findByIdAndDelete(req.params.id);

    if (!result) {
      return ApiResponse.notFound(res, "Album not found");
    }

    return ApiResponse.success(res, null, "Album deleted successfully");
  }),
);

module.exports = router;

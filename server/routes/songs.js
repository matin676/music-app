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

const axios = require("axios");
const mm = require("music-metadata");

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
    const {
      name,
      imageURL,
      songURL,
      album,
      artist,
      language,
      category,
      isPublic,
    } = req.body;

    // Basic validation
    if (!name || !imageURL || !songURL || !artist || !language || !category) {
      return ApiResponse.validationError(res, null, "Missing required fields");
    }

    let metadata = {};
    try {
      // Stream audio for metadata extraction
      const response = await axios({
        method: "get",
        url: songURL,
        responseType: "stream",
      });

      const parsedMetadata = await mm.parseStream(response.data);
      metadata = {
        duration: parsedMetadata.format.duration,
        bitrate: parsedMetadata.format.bitrate,
        format: parsedMetadata.format.container,
      };
    } catch (error) {
      console.error("Metadata extraction failed:", error.message);
      // Proceed without metadata if extraction fails
    }

    const newSong = new Song({
      name,
      imageURL,
      songURL,
      album,
      artist,
      language,
      category,
      isPublic: isPublic !== undefined ? isPublic : true,
      ...metadata,
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
 * @desc    Get all songs with search, filter, and sort
 * @access  Public
 */
router.get(
  "/getall",
  asyncHandler(async (req, res) => {
    const { search, genre, artist, language, album, sort, isPublic } =
      req.query;

    const conditions = [];
    let query = {};

    // Public/Private filter
    if (isPublic !== undefined) {
      if (isPublic === "true") {
        // Match explicit true OR missing field (legacy compatibility)
        conditions.push({
          $or: [{ isPublic: true }, { isPublic: { $exists: false } }],
        });
      } else {
        conditions.push({ isPublic: false });
      }
    }

    // Search (Regex-based fallback for robustness)
    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { artist: { $regex: search, $options: "i" } },
          { album: { $regex: search, $options: "i" } },
          { language: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Filters
    // Filters (Fuzzy/Case-insensitive)
    if (genre) conditions.push({ category: { $regex: genre, $options: "i" } });
    if (artist) conditions.push({ artist: { $regex: artist, $options: "i" } });
    if (language)
      conditions.push({ language: { $regex: language, $options: "i" } });
    if (album) conditions.push({ album: { $regex: album, $options: "i" } });

    // Construct final query
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default new to old
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "popularity") sortOption = { playCount: -1 };

    const songs = await Song.find(query).sort(sortOption).lean();
    return ApiResponse.success(res, songs, "Songs retrieved successfully");
  }),
);

/**
 * @route   GET /api/songs/stats
 * @desc    Get aggregated stats (Top artists, categories, etc.)
 * @access  Public
 */
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const pipeline = [
      {
        $facet: {
          totalSongs: [{ $count: "count" }],
          songsByCategory: [
            { $unwind: "$category" },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          songsByArtist: [
            { $unwind: "$artist" },
            { $group: { _id: "$artist", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          songsByLanguage: [
            { $group: { _id: "$language", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ];

    const stats = await Song.aggregate(pipeline);
    return ApiResponse.success(res, stats[0], "Stats retrieved successfully");
  }),
);

/**
 * @route   PUT /api/songs/play/:id
 * @desc    Increment song play count
 * @access  Public
 */
router.put(
  "/play/:id",
  asyncHandler(async (req, res) => {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { playCount: 1 } },
      { new: true },
    );

    if (!song) {
      return ApiResponse.notFound(res, "Song not found");
    }

    return ApiResponse.success(res, song, "Play count updated");
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
    const {
      name,
      imageURL,
      songURL,
      album,
      artist,
      language,
      category,
      isPublic,
    } = req.body;

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      {
        name,
        imageURL,
        songURL,
        album,
        artist,
        language,
        category,
        isPublic,
      },
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

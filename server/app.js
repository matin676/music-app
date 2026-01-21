/**
 * MusicApp Server
 *
 * Express server with MongoDB and Firebase authentication
 *
 * ARCHITECTURE:
 * - All routes use standardized ApiResponse format
 * - Protected routes use authenticate/requireAdmin middleware
 * - Global error handler catches all unhandled errors
 */
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv/config");

const { errorHandler } = require("./src/middleware");

const app = express();

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MusicApp API is running",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
const userRoute = require("./routes/auth");
const artistsRoutes = require("./routes/artist");
const albumsRoutes = require("./routes/albums");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlist");

app.use("/api/users", userRoute);
app.use("/api/artists", artistsRoutes);
app.use("/api/albums", albumsRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (MUST be last middleware)
app.use(errorHandler);

// Database connection
mongoose
  .connect(process.env.DB_STRING)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

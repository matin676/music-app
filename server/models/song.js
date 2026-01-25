const mongoose = require("mongoose");

const songSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
    songURL: {
      type: String,
      required: true,
    },
    album: {
      type: String,
    },
    artist: {
      type: [String],
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    duration: {
      type: Number, // in seconds
    },
    bitrate: {
      type: Number,
    },
    format: {
      type: String,
    },
    playCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Text index for fuzzy search
songSchema.index({
  name: "text",
  artist: "text",
  album: "text",
  language: "text",
  category: "text",
});

module.exports = mongoose.model("song", songSchema);

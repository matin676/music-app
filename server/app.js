const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
require("dotenv/config");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.json("Hi there!");
});

// User Authentication Route
const userRoute = require("./routes/auth");
app.use("/api/users/", userRoute);

//Artist Routes
const artistsRoutes = require("./routes/artist");
app.use("/api/artists/", artistsRoutes);

//Albums Routes
const albumsRoutes = require("./routes/albums");
app.use("/api/albums/", albumsRoutes);

//Songs Routes
const songRoutes = require("./routes/songs");
app.use("/api/songs/", songRoutes);

//Playlists Routes
const playlistRoutes = require("./routes/playlist");
app.use("/api/playlists/", playlistRoutes);

mongoose.connect(process.env.DB_STRING);
mongoose.connection
  .once("open", () => console.log("Connected..."))
  .on("error", (error) => {
    console.log(`Error : ${error}`);
  });

app.listen(process.env.PORT || 4000, () => {
  console.log(`Listening to port ${process.env.PORT || 4000}`);
});

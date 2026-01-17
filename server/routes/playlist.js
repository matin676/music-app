const router = require("express").Router();

const Playlist = require("../models/playlist");

router.post("/savePlaylist", async (req, res) => {
  const newPlaylist = new Playlist({
    name: req.body.name,
    imageURL: req.body.imageURL,
    songs: req.body.songs.map((songId) => ({
      songId: songId,
      addedAt: Date.now(),
    })),
    user: req.body.user,
  });
  try {
    const savedPlaylist = await newPlaylist.save();
    return res.status(200).send({ success: true, playlist: savedPlaylist });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.get("/getall", async (req, res) => {
  try {
    const playlists = await Playlist.find().sort({ createdAt: -1 });

    // Migration: Convert string IDs to Objects if needed
    const updatedPlaylists = await Promise.all(
      playlists.map(async (playlist) => {
        if (
          playlist.songs.length > 0 &&
          typeof playlist.songs[0] === "string"
        ) {
          playlist.songs = playlist.songs.map((songId) => ({
            songId: songId,
            addedAt: playlist.createdAt,
          }));
          await playlist.save();
        }
        return playlist;
      })
    );

    res.status(200).send({ success: true, data: updatedPlaylists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getplaylist/:id", async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const data = await Playlist.findOne(filter);

    if (data) {
      // Migration check
      if (data.songs.length > 0 && typeof data.songs[0] === "string") {
        data.songs = data.songs.map((songId) => ({
          songId: songId,
          addedAt: data.createdAt,
        }));
        await data.save();
      }
      return res.status(200).send({ success: true, playlist: data });
    } else {
      return res.status(400).send({ success: false, msg: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching playlist by ID:", error);
    return res
      .status(500)
      .send({ success: false, msg: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  const filter = { _id: req.params.id };
  const options = {
    upsert: true,
    new: true,
  };

  try {
    const result = await Playlist.findOneAndUpdate(
      filter,
      {
        name: req.body.name,
        imageURL: req.body.imageURL,
      },
      options
    );

    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

// Add song to playlist
router.put("/update/:id/add", async (req, res) => {
  const filter = { _id: req.params.id };
  const songId = req.body.songId;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(400)
        .send({ success: false, msg: "Playlist not found" });
    }

    // Check if song already exists
    const songExists = playlist.songs.some((item) => item.songId === songId);
    if (!songExists) {
      playlist.songs.push({ songId: songId, addedAt: Date.now() });
      const result = await playlist.save();
      return res.status(200).send({ success: true, data: result });
    } else {
      return res.status(200).send({
        success: true,
        data: playlist,
        msg: "Song already in playlist",
      });
    }
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

// Remove song from playlist
router.put("/update/:id/remove", async (req, res) => {
  const filter = { _id: req.params.id };
  const songId = req.body.songId;

  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res
        .status(400)
        .send({ success: false, msg: "Playlist not found" });
    }

    playlist.songs = playlist.songs.filter((item) => item.songId !== songId);
    const result = await playlist.save();
    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.delete("/deleteplaylist/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const result = await Playlist.deleteOne(filter);

  if (result.deletedCount === 1) {
    return res
      .status(200)
      .send({ success: true, msg: "Data deleted successfully" });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

module.exports = router;

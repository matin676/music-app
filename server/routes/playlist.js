const router = require("express").Router();

const playlist = require("../models/playlist");

router.post("/savePlaylist", async (req, res) => {
  const newPlaylist = playlist({
    name: req.body.name,
    imageURL: req.body.imageURL,
    songs: req.body.songs,
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
    const playlists = await playlist.find();

    res.status(200).json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/getplaylist/:id", async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    const data = await playlist.findOne(filter);

    if (data) {
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

router.delete("/deleteplaylist/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const result = await playlist.deleteOne(filter);

  if (result) {
    return res
      .status(200)
      .send({ success: true, msg: "Data deleted successfully" });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

module.exports = router;

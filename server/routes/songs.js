const router = require("express").Router();

const Song = require("../models/song");

router.post("/save", async (req, res) => {
  const newSong = new Song({
    name: req.body.name,
    imageURL: req.body.imageURL,
    songURL: req.body.songURL,
    album: req.body.album,
    artist: req.body.artist,
    language: req.body.language,
    category: req.body.category,
  });

  try {
    const savedSong = await newSong.save();
    return res.status(200).send({ success: true, song: savedSong });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.get("/getone/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const data = await Song.findOne(filter);

  if (data) {
    return res.status(200).send({ success: true, song: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.get("/getall", async (req, res) => {
  const data = await Song.find().sort({ createdAt: 1 }).lean();

  if (data) {
    return res.status(200).send({ success: true, song: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.put("/update/:id", async (req, res) => {
  const filter = { _id: req.params.id };
  const options = { new: true };

  try {
    const result = await Song.findOneAndUpdate(
      filter,
      {
        name: req.body.name,
        imageURL: req.body.imageURL,
        songURL: req.body.songURL,
        album: req.body.album,
        artist: req.body.artist,
        language: req.body.language,
        category: req.body.category,
      },
      options
    );

    if (result) {
      return res.status(200).send({ success: true, data: result });
    } else {
      return res.status(404).send({ success: false, msg: "Song not found" });
    }
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const result = await Song.deleteOne(filter);

  if (result.deletedCount === 1) {
    return res
      .status(200)
      .send({ success: true, msg: "Data deleted successfully" });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

module.exports = router;

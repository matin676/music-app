const router = require("express").Router();

const Artist = require("../models/artist");

router.post("/save", async (req, res) => {
  const newArtist = new Artist({
    name: req.body.name,
    imageURL: req.body.imageURL,
    twitter: req.body.twitter,
    instagram: req.body.instagram,
  });

  try {
    const savedArtist = await newArtist.save();
    return res.status(200).send({ success: true, artist: savedArtist });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.get("/getone/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const data = await Artist.findOne(filter);

  if (data) {
    return res.status(200).send({ success: true, artist: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.get("/getall", async (req, res) => {
  const data = await Artist.find().sort({ createdAt: 1 }).lean();

  if (data) {
    return res.status(200).send({ success: true, artist: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.put("/update/:id", async (req, res) => {
  const filter = { _id: req.params.id };
  const options = { new: true };

  try {
    // 1. Find the existing artist to get the OLD name
    const oldArtist = await Artist.findOne(filter);
    if (!oldArtist) {
      return res.status(404).send({ success: false, msg: "Artist not found" });
    }

    const oldName = oldArtist.name;
    const newName = req.body.name;

    // 2. Update the Artist document
    const result = await Artist.findOneAndUpdate(
      filter,
      {
        name: newName,
        imageURL: req.body.imageURL,
        twitter: req.body.twitter,
        instagram: req.body.instagram,
      },
      options
    );

    // 3. If name changed, update ALL songs that reference the old artist name
    if (result && oldName !== newName) {
      const Song = require("../models/song");
      await Song.updateMany({ artist: oldName }, { $set: { artist: newName } });
    }

    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const result = await Artist.deleteOne(filter);

  if (result.deletedCount === 1) {
    return res
      .status(200)
      .send({ success: true, msg: "Data deleted successfully" });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

module.exports = router;

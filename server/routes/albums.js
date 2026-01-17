const router = require("express").Router();

const Album = require("../models/album");

router.post("/save", async (req, res) => {
  const newAlbum = new Album({
    name: req.body.name,
    imageURL: req.body.imageURL,
  });

  try {
    const savedAlbum = await newAlbum.save();
    return res.status(200).send({ success: true, album: savedAlbum });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.get("/getone/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const data = await Album.findOne(filter);

  if (data) {
    return res.status(200).send({ success: true, album: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.get("/getall", async (req, res) => {
  const data = await Album.find().sort({ createdAt: 1 }).lean();

  if (data) {
    return res.status(200).send({ success: true, album: data });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

router.put("/update/:id", async (req, res) => {
  const filter = { _id: req.params.id };
  const options = { new: true };

  try {
    // 1. Find the existing album to get its OLD name
    const oldAlbum = await Album.findOne(filter);
    if (!oldAlbum) {
      return res.status(404).send({ success: false, msg: "Album not found" });
    }

    const oldName = oldAlbum.name;
    const newName = req.body.name;

    // 2. Update the Album document
    const result = await Album.findOneAndUpdate(
      filter,
      {
        name: newName,
        imageURL: req.body.imageURL,
      },
      options
    );

    // 3. If the name has changed, update ALL songs that reference the old name
    if (result && oldName !== newName) {
      const Song = require("../models/song");
      await Song.updateMany({ album: oldName }, { $set: { album: newName } });
    }

    return res.status(200).send({ success: true, data: result });
  } catch (error) {
    return res.status(400).send({ success: false, msg: error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const filter = { _id: req.params.id };

  const result = await Album.deleteOne(filter);

  if (result.deletedCount === 1) {
    return res
      .status(200)
      .send({ success: true, msg: "Data deleted successfully" });
  } else {
    return res.status(400).send({ success: false, msg: "Data not found" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Gacha = require("../../model/gacha");
const auth = require("../../middleware/auth");
const uploadGacha = require("../../multer/gacha_multer");

router.post("/add", uploadGacha.single("file"), async (req, res) => {
  const { name, price, totalNum, category } = req.body;
  if (req.file == null || req.file == undefined) {
    res.return({ status: 2, msg: "file is not selected." });
  }
  const newGacha = new Gacha({
    name: name,
    price: price,
    total_number: totalNum,
    category: category,
    gacha_thumnail_url: `/uploads/gacha_thumnail/${req.file.filename}`,
    create_date: Date.now(),
  });
  const saved = await newGacha.save();
  if (saved) {
    res.send({ status: 1, msg: "New Gacha Saved." });
  } else res.send({ status: 0, msg: "Save failed." });
});

router.get("/", async (req, res) => {
  const gachaList = await Gacha.find();
  if (gachaList) {
    res.send({
      status: 1,
      gachaList: gachaList,
    });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  Gacha.deleteOne({ _id: id })
    .then(() => res.send({ status: 1, msg: "Successfully deleted!" }))
    .catch((err) => {
      res.send({ status: 0, msg: "Delete failed!", error: err });
    });
});
module.exports = router;

const express = require("express");
const path = require("path");
const router = express.Router();
const Gacha = require("../../models/gacha");
const auth = require("../../middleware/auth");
const uploadGacha = require("../../utils/multer/gacha_multer");
const deleteFile = require("../../utils/delete");
//Gacha add
router.post("/add", auth, uploadGacha.single("file"), async (req, res) => {
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
    res.send({ status: 1, msg: "New Gacha Saved successfully." });
  } else res.send({ status: 0, msg: "Gacha Save failed." });
});

router.post("/upload_bulk", auth, (req, res) => {
  const { gachaId, prizes } = req.body;

  console.log("req.body", req.body);
  console.log("gachaId", gachaId);
  console.log("prizes", prizes);
  Gacha.findOne({ _id: gachaId })
    .then((gacha) => {
      gacha.prize = prizes;
      gacha
        .save()
        .then((res) => {
          res.send({ status: 1, msg: "upload prizes successfully." });
        })
        .catch((err) =>
          res.send({ status: 0, msg: "upload prizes failed.", err: err })
        );
    })
    .catch((err) => res.send({ status: 0, err: err }));
});

router.get("/", async (req, res) => {
  const gachaList = await Gacha.find()
    .then((gachalist) => {
      res.send({ status: 1, gachaList: gachalist });
    })
    .catch((err) => {
      res.send({ status: 0, err: err });
    });
});
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const gacha = await Gacha.find({ _id: id })
    .then((gacha) => {
      res.send({ status: 1, gacha: gacha });
    })
    .catch((err) => {
      res.send({ status: 0, err: err });
    });
});
router.get("/get_prize/:id", auth, (req, res) => {
  const id = req.params.id;
  Gacha.findOne({ _id: id })
    .then((gacha) => {
      res.send({ status: 1, prizeList: gacha.prize });
    })
    .catch((err) => res.send({ status: 0, err: err }));
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  Gacha.findOne({ _id: id })
    .then(async (gacha) => {
      const filePath = path.join("./", gacha.gacha_thumnail_url);
      try {
        await deleteFile(filePath);
        gacha.deleteOne();
        res.send({ status: 1 });
      } catch (err) {
        res.send({ status: 0, err: err });
      }
    })
    .catch((err) => {
      res.send({ status: 0, msg: "Delete failed!", error: err });
    });
});
module.exports = router;

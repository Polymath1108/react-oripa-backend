const express = require("express");
const router = express.Router();
const uploadPrize = require("../../utils/multer/prize_multer");

const auth = require("../../middleware/auth");
const adminSchemas = require("../../model/admin");

router.get("/admin_test", (req, res) => {
  res.send("amdin test is sucessful.");
});

/* Category Management */
router.get("/get_category", async (req, res) => {
  const category = await adminSchemas.Category.find();
  if (category) {
    // console.log(category)
    res.send({
      status: 1,
      category: category,
    });
  } else {
    res.send({
      status: 0,
    });
  }
});

router.post("/add_category", auth, async (req, res) => {
  const { name, description } = req.body;
  console.log("Category name", name);
  if (name && description) {
    const newCategory = new adminSchemas.Category({
      name: name,
      description: description,
    });
    const saveCategory = await newCategory.save();
    if (saveCategory) {
      res.send({ status: 1, msg: "New category added." });
    } else {
      res.send({ status: 0, msg: "Failed to add." });
    }
  }
});

router.delete("/del_category/:id", auth, async (req, res) => {
  const id = req.params.id;
  console.log("del_id", id);
  adminSchemas.Category.deleteOne({ _id: id }).then((cat) =>
    res.send({ status: 1, msg: "Deleted!" })
  );
});

/* Prize Management */
router.post("/prize_upload", uploadPrize.single("file"), async (req, res) => {
  const { name, rarity, cashBack } = req.body;
  console.log("req.file", req.file);
  const newPrize = new adminSchemas.Prize({
    name: name,
    rarity: rarity,
    cashback: cashBack,
    img_url: `/uploads/prize/${req.file.filename}`,
  });
  const saved = await newPrize.save();
  if (saved) {
    res.send({
      status: 1,
      msg: "New prize added",
    });
  } else {
    res.send({
      status: 0,
      msg: "Prize save failed.",
    });
  }
  // res.send({ filePath: `/uploads/${req.file.filename}` });
});
router.get("/get_prize", auth, async (req, res) => {
  const prize = await adminSchemas.Prize.find();
  if (prize) {
    res.send({
      status: 1,
      prize: prize,
    });
  } else {
    res.send({
      status: 0,
    });
  }
});
router.delete("/del_prize/:id", auth, async (req, res) => {
  const id = req.params.id;
  adminSchemas.Prize.deleteOne({ _id: id })
    .then(() => {
      res.send({ status: 1, msg: "Prize deleted!" });
    })
    .catch((err) => {
      res.send({ status: 0, msg: "delete failed!", err: err });
    });
});
module.exports = router;

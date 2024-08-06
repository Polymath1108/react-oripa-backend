const express = require("express");
const router = express.Router();
const uploadPrize = require("../../utils/multer/prize_multer");
const uploadPoint = require("../../utils/multer/point_multer");

const auth = require("../../middleware/auth");
const adminSchemas = require("../../models/admin");

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

router.post("/edit_category", auth, async (req, res) => {
  const { id, name, description } = req.body;
  adminSchemas.Category.findOne({ _id: id })
    .then((category) => {
      category.name = name;
      category.description = description;
      category
        .save()
        .then(() =>
          res.send({ status: 1, msg: "Category updated successfully." })
        );
    })
    .catch((err) =>
      res.send({ status: 0, msg: "category update failed.", err: err })
    );
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
  const { id, name, rarity, cashBack } = req.body;
  const prizeData = {
    name: name,
    rarity: rarity,
    cashback: cashBack,
  };
  if (req.file != undefined)
    prizeData.img_url = `/uploads/prize/${req.file.filename}`;
  console.log("req.file", req.file);

  if (id != "") {
    console.log("update id----->", id);
    await adminSchemas.Prize.updateOne({ _id: id }, prizeData)
      .then((res) => {
        return res.send({ status: 1, msg: "Updated successfully." });
      })
      .catch((err) => {
        return res.send({ status: 0, msg: "Update failed" });
      });
  } else {
    const newPrize = new adminSchemas.Prize(prizeData);
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
  }
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

/* Point management */
//get all registered point
router.get("/get_point", auth, async (req, res) => {
  const points = await adminSchemas.Point.find().sort("point_num");
  if (points) {
    return res.send({ status: 1, points: points });
  } else return res.send({ status: 0 });
});

//new point add with point image uploading
router.post(
  "/point_upload",
  auth,
  uploadPoint.single("file"),
  async (req, res) => {
    const { id, pointNum, price } = req.body;
    const pointData = {
      point_num: pointNum,
      price: price,
    };
    if (req.file.filename != undefined)
      pointData.img_url = `/uploads/point/${req.file.filename}`;
    console.log("req.file", req.file);

    if (id != "") {
      console.log("update id----->", id);
      adminSchemas.Point.updateOne({ _id: id }, pointData)
        .then((res) => {
          return res.send({ status: 1, msg: "Updated successfully." });
        })
        .catch((err) => {
          return res.send({ status: 0, msg: "Update failed", err: err });
        });
    } else {
      const newPoint = new adminSchemas.Point(pointData);
      const saved = await newPoint.save();
      if (saved) {
        res.send({
          status: 1,
          msg: "New point added",
        });
      } else {
        res.send({
          status: 0,
          msg: "point save failed.",
        });
      }
    }
  }
);

//delete point by id
router.delete("/del_point/:id", auth, (req, res) => {
  const id = req.params.id;
  adminSchemas.Point.deleteOne({ _id: id })
    .then(() => res.send({ status: 1 }))
    .catch((err) => res.send({ status: 0, err: err }));
});
module.exports = router;

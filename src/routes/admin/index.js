const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uploadPrize = require("../../utils/multer/prize_multer");
const uploadPoint = require("../../utils/multer/point_multer");
const path = require("path");
const auth = require("../../middleware/auth");
const adminSchemas = require("../../models/admin");
const deleteFile = require("../../utils/delete");

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
  adminSchemas.Prize.findOne({ _id: id })
    .then(async (prize) => {
      // if (prize.status == "set")
      //   return res.send({ status: 0, msg: "Can't delete set prize" });
      const filename = prize.img_url;
      const filePath = path.join("./", filename);
      console.log("filepath------->", filePath);
      try {
        await deleteFile(filePath);
        prize.deleteOne();
        res.send({ status: 1, msg: "prize deleted successfully." });
      } catch (err) {
        console.error("Error deleting file:", err);
        res.status(500).send({ status: 0, msg: "Error deleting file" });
      }
    })
    .catch((err) =>
      res.send({ status: 0, msg: "prize finding error", err: err })
    );
});

/* Point management */
//get all registered point
router.get("/get_point", auth, async (req, res) => {
  adminSchemas.Point.find()
    .sort("point_num")
    .then((points) => {
      return res.send({ status: 1, points: points });
    })
    .catch((err) => res.send({ status: 0, err: err }));
});

//new point add or update point with point image uploading
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
    if (req.file?.filename != undefined)
      pointData.img_url = `/uploads/point/${req.file.filename}`;

    if (id != "") {
      console.log("update id----->", id);
      adminSchemas.Point.findOne({ _id: id })
        .then(async (point) => {
          try {
            const filePath = path.join("./", point.img_url);
            await deleteFile(filePath);
          } catch (err) {
            console.log("point image file deleting error", err);
          }
          adminSchemas.Point.updateOne({ _id: id }, pointData)
            .then(() => res.send({ status: 2 }))
            .catch((err) => res.send({ status: 0, err: err }));
        })
        .catch((err) => {
          return res.send({ status: 0, err: err });
        });
    } else {
      const newPoint = new adminSchemas.Point(pointData);
      newPoint
        .save()
        .then(() => {
          res.send({
            status: 1,
          });
        })
        .catch((err) =>
          res.send({
            status: 0,
            err: err,
          })
        );
    }
  }
);

//delete point with image deleting by id
router.delete("/del_point/:id", auth, (req, res) => {
  const id = req.params.id;
  adminSchemas.Point.findOne({ _id: id })
    .then(async (point) => {
      const filePath = path.join("./", point.img_url);
      try {
        await deleteFile(filePath);
      } catch (err) {
        console.log("point iamge deleting error", err);
      }
      point
        .deleteOne()
        .then(() => {
          return res.send({ status: 1 });
        })
        .catch((err) => res.send({ status: 0, err: err }));
    })
    .catch((err) => res.send({ status: 0, err: err }));
});

/* administator management */
router.get("/get_adminList", auth, (req, res) => {
  adminSchemas.Administrator.find()
    .then((admin) => res.send({ status: 1, adminList: admin }))
    .catch((err) => res.send({ status: 0, err: err }));
});

router.post("/add_admin", auth, (req, res) => {
  const { adminId, name, email, password } = req.body;
  if (
    name == (undefined || "") ||
    email == (undefined || "") ||
    password == (undefined || "")
  )
    res.send({ status: 0, msg: "invalid input data." });
  console.log("req.body", req.body);
  const admin_data = {
    name: name,
    email: email,
    password: password,
  };

  if (adminId == undefined || adminId == "") {
    const newAdmin = new adminSchemas.Administrator(admin_data);
    newAdmin
      .save()
      .then(() => res.send({ status: 1 }))
      .catch((err) => res.send({ status: 0, err: err }));
  } else {
    console.log("admin update");
    adminSchemas.Administrator.updateOne({ _id: adminId }, admin_data)
      .then(() => res.send({ status: 2 }))
      .catch((err) => res.send({ status: 0, err: err }));
  }
});

router.delete("/del_admin/:id", auth, (req, res) => {
  const id = req.params.id;
  adminSchemas.Administrator.deleteOne({ _id: id })
    .then(() => res.send({ status: 1 }))
    .catch((err) => res.send({ status: 0, err: err }));
});
module.exports = router;

const express = require("express");
const path = require("path");
const router = express.Router();
const Gacha = require("../../models/gacha");
const auth = require("../../middleware/auth");
const uploadGacha = require("../../utils/multer/gacha_multer");
const deleteFile = require("../../utils/delete");
const adminSchemas = require("../../models/admin");
const CardDeliver = require("../../models/card_delivering");
const User = require("../../models/user");
const PointLog = require("../../models/point_log");
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
//set prizes from csv file
router.post("/upload_bulk", auth, (req, res) => {
  const { gachaId, prizes } = req.body;

  adminSchemas.Prize.create(prizes)
    .then((prize) => {
      Gacha.findOne({ _id: gachaId })
        .then((gacha) => {
          console.log("added prizes", prize);
          if (gacha.remain_prizes.length > 0) {
            let temp = gacha.remain_prizes;
            console.log("temp", temp);
            temp.push(prize);
            gacha.remain_prizes = temp;
          } else gacha.remain_prizes = prize;

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
    })
    .catch((err) =>
      res.send({ status: 0, msg: "Invalid Prizes Data", err: err })
    );
});
//get all registered gachas
router.get("/", async (req, res) => {
  await Gacha.find()
    .then((gachalist) => {
      res.send({ status: 1, gachaList: gachalist });
    })
    .catch((err) => {
      res.send({ status: 0, err: err });
    });
});
//get gacha by id
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  await Gacha.find({ _id: id })
    .then((gacha) => {
      res.send({ status: 1, gacha: gacha });
    })
    .catch((err) => {
      res.send({ status: 0, err: err });
    });
});
//get prizes setted to gacha by id
router.get("/get_prize/:id", auth, (req, res) => {
  const id = req.params.id;
  Gacha.findOne({ _id: id })
    .then((gacha) => {
      res.send({ status: 1, prizeList: gacha.remain_prizes });
    })
    .catch((err) => res.send({ status: 0, err: err }));
});

//set gacah release
router.get("/set_release/:id", auth, (req, res) => {
  const id = req.params.id;
  Gacha.findOne({ _id: id })
    .then((gacha) => {
      gacha.isRelease = !gacha.isRelease;
      gacha.save().then(() => res.send({ status: 1 }));
    })
    .catch((err) => res.send({ status: 0, msg: "Not Found Gacha", err: err }));
});
//unset prize from gacha
router.post("/unset_prize", auth, (req, res) => {
  const { gachaId, prizeId } = req.body;
  console.log("req.body", req.body);
  console.log("gachaId", gachaId);
  Gacha.findOne({ _id: gachaId })
    .then((gacha) => {
      let prize = gacha.remain_prizes;
      console.log("prize set");
      prize = prize.filter((data) => data._id != prizeId);
      console.log("filtered prize-->", prize);
      gacha.remain_prizes = prize;
      gacha
        .save()
        .then(() => {
          adminSchemas.Prize.findOne({ _id: prizeId }).then((selPrize) => {
            console.log("sel selPrize", selPrize);
            selPrize.status = "unset";
            selPrize
              .save()
              .then(() => res.send({ status: 1 }))
              .catch((err) =>
                res.send({ status: 0, msg: "Prize save failed.", err: err })
              );
          });
        })
        .catch((err) =>
          res.send({ status: 0, msg: "gacha save failed.", err: err })
        );
    })
    .catch((err) => res.send({ status: 0, msg: "gacha not found", err: err }));
});
//set prize to gacha
router.post("/set_prize", auth, (req, res) => {
  const { gachaId, prizeId } = req.body;
  Gacha.findOne({ _id: gachaId })
    .then((gacha) => {
      adminSchemas.Prize.findOne({ _id: prizeId }).then(async (prize) => {
        prize.status = "set";
        await prize.save();
        gacha.remain_prizes.push(prize);
        gacha
          .save()
          .then(() => res.send({ status: 1 }))
          .catch((err) =>
            res.send({ status: 0, msg: "gacha save failed.", err: err })
          );
      });
    })
    .catch((err) => res.send({ status: 0, msg: "Not found gacha", err: err }));
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

router.post("/draw_gacha", auth, async (req, res) => {
  const { gachaId, draw, user } = req.body;
  console.log("req.user-->", user);
  const userData = await User.findOne({ _id: user.user_id });
  Gacha.findOne({ _id: gachaId })
    .then((gacha) => {
      const drawPoint = gacha.price * draw;
      if (userData.point_remain < drawPoint)
        return res.send({ status: 0, msg: "point not enough" });
      //gacha draw with droprate
      const index = Math.floor(Math.random() * gacha.remain_prizes.length);
      console.log("index", index);
      const popPrize = gacha.remain_prizes[index]; //poped prize
      console.log("popPrize", popPrize);
      gacha.remain_prizes = gacha.remain_prizes.filter(
        (prize) => prize._id != popPrize._id
      ); //remove gacha remain_prize list
      gacha.poped_prizes.push(popPrize); //add popPrize to gacha poped_prize
      gacha
        .save()
        .then(() => {
          console.log("gacha saved");
          adminSchemas.Prize.deleteOne({ _id: popPrize._id }) //remove from prizelist
            .then(() => {
              const newDeliverData = new CardDeliver({
                user_id: userData._id,
                gachaId: gacha._id,
                prizes: popPrize,
                status: "pending",
              });
              console.log(newDeliverData);
              newDeliverData.save().then(() => {
                userData.point_remain -= drawPoint;
                userData
                  .save()
                  .then(() =>
                    res.send({
                      status: 1,
                      msg: "gachaDraw Success.",
                      prizes: popPrize,
                    })
                  )
                  .catch((err) =>
                    res.send({ status: 0, msg: "User save failed." })
                  );
                // PointLog
              });
            })
            .catch((err) => res.send("remove Prizelist failed"));
        })
        .catch((err) =>
          res.send({ status: 0, msg: "gacha save failed", err: err })
        );
    })
    .catch({ status: 0, msg: "gacha not found" });
});
module.exports = router;

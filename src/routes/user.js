const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const Users = require("../models/user");
const adminSchemas = require("../models/admin");
const PointLog = require("../models/point_log");
const CardDeliver = require("../models/card_delivering");

router.post("/register", (req, res) => {
  console.log("user data", req.body);
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      const user = new Users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        hashedPass: hashedPassword,
      });
      user
        .save()
        .then((result) => {
          res.send({
            status: 1,
            msg: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send({ message: "Error creating user", error });
        });
    })
    .catch((e) => {
      res
        .status(500)
        .send({ message: "Password was not hashed successfully", e });
    });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  var payload;
  const admin = await adminSchemas.Administrator.findOne({ email: email });
  if (admin) {
    console.log("admin", admin);
    if (password == admin.password) {
      payload = {
        user_id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      };
      const token = jwt.sign(payload, "RANDOM-TOKEN", { expiresIn: "1h" });
      res.send({
        status: 1,
        message: "Login Successful",
        user: payload,
        token,
      });
    } else {
      res.send({ status: 0 });
    }
  } else {
    await Users.findOne({ email: email })
      .then((user) => {
        bcrypt
          .compare(password, user.hashedPass)
          .then((checkPass) => {
            if (checkPass) {
              payload = {
                user_id: user._id,
                name: user.name,
                email: user.email,
              };
              const token = jwt.sign(payload, "RANDOM-TOKEN", {
                expiresIn: "1h",
              });
              res.send({
                status: 1,
                message: "Login Successful",
                user: user,
                token,
              });
            } else
              return res.send({
                status: 0,
                message: "Passwords does not match",
              });
            console.log("user payload", payload);
          })
          .catch((err) =>
            res.send({ status: 0, msg: "Input data invalid", err: err })
          );
      })
      .catch((error) => {
        res.send({ status: 0, message: "Passwords does not match", error });
      });
  }
});

router.get("/get_user/:id", auth, (req, res) => {
  const id = req.params.id;
  console.log("user_id", id);
  Users.findOne({ _id: id })
    .then((user) => {
      res.send({ status: 1, msg: "get User succeeded.", user: user });
    })
    .catch((err) => res.send({ status: 0, msg: "get User failed.", err: err }));
});
router.get("/get_userList", auth, (req, res) => {
  Users.find()
    .then((users) => res.send({ status: 1, userList: users }))
    .catch((err) => res.send({ status: 0, err: err }));
});
router.get("/get_point_log/:id", auth, (req, res) => {
  const id = req.params.id;
  PointLog.find({ user_id: id })
    .then((log) => res.send({ status: 1, pointLog: log }))
    .catch((err) => res.send({ status: 0, err: err }));
});

//save user data from user profile page
router.post("/save_user", auth, (req, res) => {
  const userData = req.body;
  console.log("userData", userData);
  Users.updateOne({ _id: userData._id }, userData)
    .then(() => res.send({ status: 1 }))
    .catch((err) => res.send({ status: 0, err: err }));
});
//get deliver data by user id
router.get("/get_deliver/:user_id", auth, (req, res) => {
  const user_id = req.params.user_id;
  CardDeliver.find({ user_id: user_id })
    .then((data) => res.send({ status: 1, deliver: data }))
    .catch((err) => res.send({ status: 0, err: err }));
});

router.get("/get_cards/:user_id", auth, (req, res) => {
  const user_id = req.params.user_id;
  Users.findOne({ _id: user_id })
    .then((user) => res.send({ status: 1, cards: user.obtain_cards }))
    .catch((err) => res.send({ status: 0, err: err }));
});
module.exports = router;

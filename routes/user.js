const express = require("express");
const router = express.Router();
const User = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", (req, res) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hashedPassword) => {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });
      user
        .save()
        .then((result) => {
          res.status(201).send({
            message: "User Created Successfully",
            result,
          });
        })
        .catch((error) => {
          res.status(500).send({ message: "Error creating user", error });
        });
    })
    .catch((e) => {
      res
        .status(500)
        .send({ message: "Password was not hashed successfully", e });
    });
});

router.post("/login", (req, res) => {
  if (req.body.email === "admin@email.com") {
    if (req.body.password === "oripa_admin") {
      const userData = {
        name: "Admin",
        eamil: "admin@email.com",
      };
      const token = jwt.sign(userData, "RANDOM-TOKEN", { expiresIn: "1h" });
      return res.send({
        status: 1,
        message: "Admin Login",
        user: userData,
        token,
      });
    } else {
      return res.send({
        status: 0,
        message: "Passwords does not match",
      });
    }
  }
  User.findOne({ email: req.body.email })
    .then((user) => {
      bcrypt
        .compare(req.body.password, user.password)
        .then((passwordCheck) => {
          if (!passwordCheck) {
            // console.log("password ok")
            return res.send({
              status: 0,
              message: "Passwords does not match",
              error,
            });
          }
          // console.log("password ok")
          const token = jwt.sign(
            {
              userName: user.userName,
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "1h" }
          );

          res.send({
            status: 1,
            message: "Login Successful",
            user: user,
            token,
          });
        })
        .catch((error) => {
          res.send({ status: 0, message: "Passwords does not match", error });
        });
    })
    .catch((e) => {
      res.send({ status: 0, message: "Email or Username not found", e });
    });
});

module.exports = router;

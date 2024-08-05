const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const admin = require("./router/admin");
const user = require("./router/user");
const gacha = require("./router/admin/gacha");
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  ``;
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Serve the uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/template", express.static(path.join(__dirname, "template")));
// app.use(
//   "/uploads",
//   express.static(path.join(__dirname, "uploads/gacha_thumnail"))
// );

//router for admin business
app.use("/admin", admin);
app.use("/admin/gacha", gacha);
//router for user task
app.use("/user", user);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// execute database connection
dbConnect();

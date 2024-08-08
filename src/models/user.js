const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  address: { type: String },
  city: { type: String },
  country: { type: String },
  postalCode: { type: Number },
  description: { type: String },
  point_remain: { type: Number },
});

const Users = mongoose.model("Users", UserSchema, "users");
module.exports = mongoose.model.Users || Users;

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//gacha category schema
const categorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});
//remain prize list
const prizeSchema = new Schema({
  name: { type: String, required: true },
  rarity: { type: Number, required: true },
  cashback: { type: Number, required: true },
  img_url: { type: String, required: true },
  status: { type: String, default: "unset" }, //prize status- unset, set,
});

const pointSchema = new Schema({
  point_num: { type: Number, required: true },
  price: { type: Number, required: true },
  img_url: { type: String, required: true },
});

const AdminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  read_authority: [],
  write_authority: [],
});

const Category = mongoose.model("Category", categorySchema, "admin_category");
const Prize = mongoose.model("Prize", prizeSchema, "admin_prize");
const Point = mongoose.model("model", pointSchema, "admin_point");
const Administrator = mongoose.model("Adminer", AdminSchema, "admin_adminer");
const adminSchemas = {
  Category: Category,
  Prize: Prize,
  Point: Point,
  Administrator: Administrator,
};

module.exports = adminSchemas;

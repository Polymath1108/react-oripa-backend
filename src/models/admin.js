const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const categorySchema = new Schema({
  name: { type: String },
  description: { type: String },
});

const prizeSchema = new Schema({
  name: { type: String },
  rarity: { type: Number },
  cashback: { type: Number },
  img_url: { type: String },
});

const pointSchema = new Schema({
  point_num: { type: Number },
  price: { type: Number },
  img_url: { type: String },
});

const AdminSchema = new Schema({
  name: { type: String },
  email: { type: String },
  password: { type: String },
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

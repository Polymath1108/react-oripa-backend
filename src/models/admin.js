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

const Category = mongoose.model("Category", categorySchema, "admin_category");
const Prize = mongoose.model("Prize", prizeSchema, "admin_prize");
const Point = mongoose.model("model", pointSchema, "admin_point");
const adminSchemas = {
  Category: Category,
  Prize: Prize,
  Point: Point,
};

module.exports = adminSchemas;

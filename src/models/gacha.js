const mongoose = require("mongoose");

const gachaSchema = new mongoose.Schema({
  name: { type: String },
  price: { type: Number },
  total_number: { type: Number },
  category: { type: String },
  prize: { type: Array },
  gacha_thumnail_url: { type: String },
  isRelease: { type: Boolean },
  create_date: { type: Date },
});

const Gacha = mongoose.model("Gacha", gachaSchema, "admin_gacha");

module.exports = Gacha;

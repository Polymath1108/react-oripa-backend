const mongoose = require("mongoose");
const { Point } = require("./admin");

const pointLogSchema = new mongoose.Schema({
  user_id: { type: String },
  point_num: { type: Number },
  date: { type: Date },
  usage: { type: String },
});

const PointLog = mongoose.model("PointLog", pointLogSchema, "point_log");
module.exports = mongoose.model.PointLog || PointLog;

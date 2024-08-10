const mongoose = require("mongoose");

const pointLogSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  point_num: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  usage: { type: String },
});

const PointLog = mongoose.model("PointLog", pointLogSchema, "point_log");
module.exports = mongoose.model.PointLog || PointLog;

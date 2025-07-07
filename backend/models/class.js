const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: String,
  description: String,
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  timeslot: Date
});

module.exports = mongoose.model("Class", classSchema);
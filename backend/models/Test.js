const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  title: String,
  description: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: Date,
  status: { type: String, enum: ["Not Started", "Completed"], default: "Not Started" }
});

module.exports = mongoose.model("Test", testSchema);
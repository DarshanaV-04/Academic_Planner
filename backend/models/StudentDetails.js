const mongoose = require("mongoose");

const studentDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  rollNo: String,
  department: String,
  year: String,
  phone: String,
});

module.exports = mongoose.model("StudentDetails", studentDetailsSchema);
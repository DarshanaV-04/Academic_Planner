const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "student"], required: true },
  rollNo: String,
  department: String,
  year: String,
  phone: String,
  
});

module.exports = mongoose.model("User", userSchema);


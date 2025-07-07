const mongoose = require("mongoose");
const express = require("express");
const Test = require("../models/Test");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { title, description, studentId, date } = req.body;
    const test = new Test({ title, description, studentId, date });
    await test.save();
    res.status(201).json({ message: "Test scheduled", test });
  } catch (err) {
    res.status(500).json({ message: "Failed to schedule test" });
  }
});

router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }
    const tests = await Test.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    res.json(tests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tests" });
  }
});
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Test.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Test status updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update test status" });
  }
});
router.get("/", async (req, res) => {
  try {
    const tests = await Test.find().populate("studentId", "name email");
    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tests" });
  }
});

module.exports = router;

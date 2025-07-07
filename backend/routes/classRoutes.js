const express = require("express");
const router = express.Router();
const Class = require("../models/class");

// Create a class for multiple students
router.post("/create", async (req, res) => {
  try {
    const { title, description, studentIds, timeslot } = req.body;
    const newClass = new Class({ title, description, studentIds, timeslot });
    await newClass.save();
    res.status(201).json({ message: "Class assigned", newClass });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign class" });
  }
});

// Get all classes
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find().populate("studentIds", "name email");
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes" });
  }
});

// Get classes for a specific student
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const classes = await Class.find({ studentIds: studentId });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes for student" });
  }
});

module.exports = router;
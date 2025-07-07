const express = require("express");
const StudentDetails = require("../models/StudentDetails");
const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { userId, name, rollNo, department, year, phone } = req.body;
    const details = new StudentDetails({
      userId,
      name,
      rollNo,
      department,
      year,
      phone,
    });
    await details.save();
    res.status(201).json({ message: "Details saved", details });
  } catch (err) {
    res.status(500).json({ message: "Failed to save details" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const details = await StudentDetails.findOne({ userId: req.params.userId });
    if (!details) return res.status(404).json({ message: "Not found" });
    res.json(details);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch details" });
  }
});

module.exports = router;

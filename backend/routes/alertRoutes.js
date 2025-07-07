const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Test = require("../models/Test");
const User = require("../models/User");
const sendSMS = require("../utils/sendSMS");

// Send SMS alerts to students with overdue assignments or missed tests
router.post("/send", async (req, res) => {
  try {
    // Find overdue assignments
    const overdueAssignments = await Assignment.find({
      status: { $ne: "Completed" },
      deadline: { $lt: new Date() },
    });
    console.log(overdueAssignments)
    // Find missed tests
    const missedTests = await Test.find({
      status: { $ne: "Completed" },
      date: { $lt: new Date() },
    });
    console.log(missedTests)
    // Collect student IDs
    const studentIds = [
      ...new Set([
        ...overdueAssignments.map((a) => a.studentId.toString()),
        ...missedTests.map((t) => t.studentId.toString()),
      ]),
    ];

    // Fetch student details
    const students = await User.find({ _id: { $in: studentIds } });

    // Send SMS to each student
    for (const student of students) {
      if (student.phone) {
        let messages = [];
        overdueAssignments
          .filter((a) => a.studentId.toString() === student._id.toString())
          .forEach((a) =>
            messages.push(`Assignment "${a.title}" is overdue!`)
          );
        missedTests
          .filter((t) => t.studentId.toString() === student._id.toString())
          .forEach((t) => messages.push(`Test "${t.title}" was missed!`));
        if (messages.length > 0) {
          await sendSMS(
            student.phone,
            `Alert from Academic Planner:\n${messages.join("\n")}`
          );
        }
      }
    }

    res.json({ message: "SMS alerts sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send SMS alerts." });
  }
});

module.exports = router;
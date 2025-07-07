const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deadline: Date,
  status: {
    type: String,
    enum: ["Not Started", "Pending", "Completed"],
    default: "Not Started",
  },
  assignmentName: String,
  originalName: String,
  filePath: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  plagiarismResult: {
    percentage: { type: Number, default: 0 },
    message: { type: String, default: "" },
    plagiarismLevel: {
      type: String,
      enum: ["None", "Low", "Medium", "High"],
      default: "None",
    },
    comparisons: [
      {
        assignmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Assignment",
        },
        assignmentTitle: String,
        studentName: String,
        similarity: Number,
        filePath: String,
      },
    ],
    totalComparisons: { type: Number, default: 0 },
    checkedAt: { type: Date, default: Date.now },
  },
});

module.exports = mongoose.model("Assignment", assignmentSchema);

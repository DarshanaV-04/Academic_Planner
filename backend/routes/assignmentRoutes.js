const express = require("express");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const stringSimilarity = require("string-similarity");

const router = express.Router();

/**
 * --------------------------
 * Multer Upload Config
 * --------------------------
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/**
 * --------------------------
 * Create Assignment (Form)
 * --------------------------
 */
router.post("/create", async (req, res) => {
  console.log("Assignment payload:", req.body);

  try {
    const { title, description, studentId, deadline } = req.body;
    const assignment = new Assignment({
      title,
      description,
      studentId,
      deadline,
    });
    await assignment.save();
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create assignment" });
  }
});

/**
 * --------------------------
 * Get Assignments by Student
 * --------------------------
 */
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    const assignments = await Assignment.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

/**
 * --------------------------
 * Update Assignment Status
 * --------------------------
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await Assignment.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
});

/**
 * --------------------------
 * Get All Assignments
 * --------------------------
 */
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find().populate(
      "studentId",
      "name email"
    );
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
});

/**
 * --------------------------
 * Upload Assignment File
 * --------------------------
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const newAssignment = new Assignment({
      studentId: req.body.studentId,
      assignmentName: req.body.assignmentName,
      filePath: req.file.path,
      originalName: req.file.originalname,
    });

    await newAssignment.save();

    res.json({ message: "Upload successful!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload failed." });
  }
});

/**
 * --------------------------
 * Utility: Extract Text from PDF
 * --------------------------
 */
const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};

/**
 * --------------------------
 * Advanced Plagiarism Checker
 * --------------------------
 */
const checkPlagiarismAdvanced = async (currentAssignmentId, currentText) => {
  try {
    // Get all other assignments with files
    const otherAssignments = await Assignment.find({
      _id: { $ne: currentAssignmentId },
      filePath: { $exists: true, $ne: null },
    });

    if (otherAssignments.length === 0) {
      return {
        percentage: 0,
        message: "No other assignments found for comparison.",
        comparisons: [],
      };
    }

    const comparisons = [];
    let highestSimilarity = 0;
    let mostSimilarAssignment = null;

    // Compare with each other assignment
    for (const otherAssignment of otherAssignments) {
      try {
        const otherFilePath = path.join(
          __dirname,
          "..",
          otherAssignment.filePath
        );

        if (!fs.existsSync(otherFilePath)) {
          continue;
        }

        let otherText = "";

        // Extract text from other assignment
        if (path.extname(otherFilePath).toLowerCase() === ".pdf") {
          const buffer = fs.readFileSync(otherFilePath);
          const data = await pdfParse(buffer);
          otherText = data.text;
        } else {
          otherText = fs.readFileSync(otherFilePath, "utf-8");
        }

        // Calculate similarity
        const similarity = stringSimilarity.compareTwoStrings(
          currentText.toLowerCase(),
          otherText.toLowerCase()
        );

        const similarityPercentage = Math.round(similarity * 100);

        comparisons.push({
          assignmentId: otherAssignment._id,
          assignmentTitle:
            otherAssignment.title ||
            otherAssignment.assignmentName ||
            "Unknown",
          studentName:
            otherAssignment.studentId?.name ||
            otherAssignment.studentId?.email ||
            "Unknown",
          similarity: similarityPercentage,
          filePath: otherAssignment.filePath,
        });

        if (similarity > highestSimilarity) {
          highestSimilarity = similarity;
          mostSimilarAssignment = otherAssignment;
        }
      } catch (error) {
        console.error(
          `Error processing assignment ${otherAssignment._id}:`,
          error
        );
      }
    }

    // Sort comparisons by similarity (highest first)
    comparisons.sort((a, b) => b.similarity - a.similarity);

    // Determine plagiarism level
    let plagiarismLevel = "None";
    let message = "No significant similarity found with other assignments.";

    if (highestSimilarity > 0.8) {
      plagiarismLevel = "High";
      message = `High similarity detected (${Math.round(
        highestSimilarity * 100
      )}%) with assignment: ${
        mostSimilarAssignment?.title ||
        mostSimilarAssignment?.assignmentName ||
        "Unknown"
      }`;
    } else if (highestSimilarity > 0.6) {
      plagiarismLevel = "Medium";
      message = `Medium similarity detected (${Math.round(
        highestSimilarity * 100
      )}%) with assignment: ${
        mostSimilarAssignment?.title ||
        mostSimilarAssignment?.assignmentName ||
        "Unknown"
      }`;
    } else if (highestSimilarity > 0.4) {
      plagiarismLevel = "Low";
      message = `Low similarity detected (${Math.round(
        highestSimilarity * 100
      )}%) with assignment: ${
        mostSimilarAssignment?.title ||
        mostSimilarAssignment?.assignmentName ||
        "Unknown"
      }`;
    }

    return {
      percentage: Math.round(highestSimilarity * 100),
      message,
      plagiarismLevel,
      comparisons,
      totalComparisons: comparisons.length,
    };
  } catch (error) {
    console.error("Error in advanced plagiarism check:", error);
    return {
      percentage: 0,
      message: "Error during plagiarism check.",
      comparisons: [],
    };
  }
};

/**
 * --------------------------
 * Plagiarism Check Route (POST)
 * --------------------------
 */
router.post("/check-plagiarism/:id", async (req, res) => {
  try {
    console.log("Checking plagiarism for assignment ID:", req.params.id);

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      console.log("Assignment not found for ID:", req.params.id);
      return res.status(404).json({ message: "Assignment not found." });
    }

    console.log("Assignment found:", {
      id: assignment._id,
      title: assignment.title || assignment.assignmentName,
      filePath: assignment.filePath,
      originalName: assignment.originalName,
    });

    if (!assignment.filePath) {
      console.log("No file path found for assignment");
      return res
        .status(400)
        .json({ message: "No file uploaded for this assignment." });
    }

    // Build absolute file path
    const fullPath = path.join(__dirname, "..", assignment.filePath);

    if (!fs.existsSync(fullPath)) {
      console.log("File not found:", fullPath);
      console.log("Assignment filePath:", assignment.filePath);
      console.log("Current directory:", __dirname);
      return res
        .status(404)
        .json({ message: "Uploaded file does not exist on server." });
    }

    let fileText = "";

    if (path.extname(fullPath).toLowerCase() === ".pdf") {
      try {
        const buffer = fs.readFileSync(fullPath);
        const data = await pdfParse(buffer);
        fileText = data.text;
      } catch (e) {
        console.error("PDF parse error:", e);
        return res.status(500).json({
          message: "Failed to parse PDF file.",
          error: e.message,
        });
      }
    } else {
      fileText = fs.readFileSync(fullPath, "utf-8");
    }

    console.log("Extracted text length:", fileText?.length);

    const result = await checkPlagiarismAdvanced(req.params.id, fileText);
    console.log("Plagiarism check result:", result);

    assignment.plagiarismResult = result;
    await assignment.save();
    console.log("Assignment updated with plagiarism result");

    res.json({
      message: "Plagiarism check complete.",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error running plagiarism check.",
      error: error.message,
      stack: error.stack,
    });
  }
});

/**
 * --------------------------
 * Get Assignment by ID (for debugging)
 * --------------------------
 */
router.get("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(
      "studentId",
      "name email"
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch assignment" });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching students' });
  }
});

router.put('/update/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});
router.get('/profile/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});
router.get('/assignments/student/:id', async (req, res) => {
  const assignments = await Assignment.find({ studentId: req.params.id });
  res.json(assignments);
});


module.exports = router;

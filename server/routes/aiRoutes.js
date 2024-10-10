const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  improveAnswer,
  evaluateResume,
} = require("../controllers/aiController"); // Import the controller

// AI Improvement route
router.post("/improve", authenticate, improveAnswer); // Use the controller function

router.post("/evaluate-resume/:userId", evaluateResume); // New route for evaluating resumes

module.exports = router;

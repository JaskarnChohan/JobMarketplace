const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  improveAnswer,
  evaluateResume,
  feedbackResume,
  getJobInsights,
} = require("../controllers/aiController"); // Import the controller

// AI Improvement route
router.post("/improve", authenticate, improveAnswer); // Use the controller function

router.post("/job-insights", getJobInsights); // Use the controller function

router.post("/evaluate-resume/:userId", evaluateResume); // New route for evaluating resumes

router.post("/resume-feedback/:profileId", feedbackResume); // New route for giving resumes feedbacks

module.exports = router;

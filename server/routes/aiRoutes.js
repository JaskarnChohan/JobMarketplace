const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
  improveAnswer,
  evaluateResume,
  feedbackResume,
  getJobInsights,
} = require("../controllers/aiController"); // Import the controller

// AI Improvement route to improve answers for interview questions
router.post("/improve", authenticate, improveAnswer); // Use the controller function

// AI Job Insights route to get insights for job descriptions
router.post("/job-insights", getJobInsights); // Use the controller function

// AI Resume Evaluation route to evaluate resumes
router.post("/evaluate-resume/:userId", evaluateResume); // New route for evaluating resumes

// AI Resume Feedback route to give feedback on resumes
router.post("/resume-feedback/:profileId", feedbackResume); // New route for giving resumes feedbacks

module.exports = router;

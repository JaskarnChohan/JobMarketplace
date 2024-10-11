const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const { improveAnswer } = require("../controllers/aiController"); // Import the controller

// AI Improvement route
router.post("/improve", authenticate, improveAnswer); // Use the controller function

module.exports = router;

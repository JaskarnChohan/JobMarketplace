// routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

router.get("/check", applicationController.checkApplication);

// Create a new application
router.post("/", applicationController.createApplication);

// Get all applications for a specific user
router.get("/:userId", applicationController.getApplicationsByUserId);

// Update the status of a specific application
router.put("/:applicationId", applicationController.updateApplicationStatus);

// Delete a specific application
router.delete("/:applicationId", applicationController.deleteApplication);

router.get("/job/:jobId", applicationController.getApplicationsByJobId);

module.exports = router;

// Import necessary modules
const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

// Route to check the status of an application
router.get("/check", applicationController.checkApplication);

// Route to create a new application
router.post("/", applicationController.createApplication);

// Route to get all applications for a specific user
router.get("/:userId", applicationController.getApplicationsByUserId);

// Route to update the status of a specific application
router.put("/:applicationId", applicationController.updateApplicationStatus);

// Route to delete a specific application
router.delete("/:applicationId", applicationController.deleteApplication);

// Route to get applications associated with a specific job
router.get("/job/:jobId", applicationController.getApplicationsByJobId);

// Export the router for use in other modules
module.exports = router;

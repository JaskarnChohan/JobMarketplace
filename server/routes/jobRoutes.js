// Import necessary modules
const express = require("express");
const {
  getJobs,
  getJobDetails,
  createJob,
  getJobsByEmployer,
  updateJobListing,
  deleteJobListing,
  getLatestJobs,
  addJobQuestions, // Import the new function
} = require("../controllers/jobController");

const router = express.Router(); // Create a new router instance

// Route to update an existing job listing by its ID
router.put("/update/:_id", updateJobListing);

// Route to delete a job listing by its ID
router.delete("/delete/:_id", deleteJobListing);

// Route to fetch jobs posted by a specific employer
router.get("/getbyemployer/:employerId", getJobsByEmployer);

// Route to fetch all jobs
router.get("/", getJobs);

// Route to create a new job listing
router.post("/create", createJob);

// Route to fetch the latest job listings
router.get("/latest", getLatestJobs);

// Route to fetch details of a specific job by job ID
router.get("/:jobId", getJobDetails);

// Route to add or update questions for a specific job listing
router.post("/:jobId/questions", addJobQuestions); // New route for job questions

// Export the router for use in other modules
module.exports = router;

const express = require("express");
const {
  getJobs,
  getJobDetails,
  createJob,
  applyToJob,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/", getJobs);
router.get("/:jobId", getJobDetails);
router.post("/create", createJob);
router.post("/:jobId/apply", applyToJob);

module.exports = router;

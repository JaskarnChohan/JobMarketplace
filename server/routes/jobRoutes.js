const express = require("express");
const {
  getJobs,
  getJobDetails,
  createJob,
  applyToJob,
  getJobsByEmployer,
  getUniqueCompanies,
  updateJobListing,
  getUniqueCategories,
  deleteJobListing,
  createApplication,
} = require("../controllers/jobController");

const router = express.Router();

router.get("/companies", getUniqueCompanies);
router.get("/categories", getUniqueCategories);
router.put("/update/:_id", updateJobListing);
router.delete("/delete/:_id", deleteJobListing);
router.post("/createapplication", createApplication);
router.get("/getbyemployer/:employerId", getJobsByEmployer);
router.get("/", getJobs);
router.post("/create", createJob);
router.post("/:jobId/apply", applyToJob);
router.get("/:jobId", getJobDetails);

module.exports = router;

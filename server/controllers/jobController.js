const jobListing = require("../models/jobListing.js");
const application = require("../models/application.js");
const Profile = require("../models/profile"); // Import the Profile model
const Application = require("../models/application"); // Import the Application model
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose");

// Create Job Listing Validation rules
const createJobValidationRules = [
  check("title", "Please provide a valid title").notEmpty().isString(),
  check("description", "Please enter a description").notEmpty(),
  check("location", "Please enter a location").notEmpty(),
  check("jobCategory", "Please select a job category").notEmpty(),
  check("salaryRange", "Please select a salary range").notEmpty(),
  check("employmentType", "Please select an employment type").notEmpty(),
  check("applicationDeadline", "Please enter an application deadline").notEmpty(),
];

exports.getLatestJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const page = parseInt(req.query.page) || 1;
    const sortBy = parseInt(req.query.sortBy) || -1;

    const query = { ...req.query };
    delete query.page;
    delete query.sortBy;

    query.status = "Open";

    const escapeRegex = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
    };

    ["title", "jobCategory", "description", "company"].forEach((field) => {
      if (query[field]) {
        query[field] = {
          $regex: new RegExp(escapeRegex(query[field]), "i"),
        };
      }
    });

    const totalJobs = await jobListing.countDocuments(query);
    const jobs = await jobListing
      .find(query)
      .sort({ datePosted: sortBy })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ jobs, totalPages: Math.ceil(totalJobs / limit) });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getJobs = async (req, res) => {
  try {
    // Create a copy of the query
    const query = { ...req.query };
    const limit = parseInt(req.query.limit) || 40; // Allow limit to be set via query
    const page = parseInt(req.query.page) || 1; // Retrieve page from query
    const sortBy = parseInt(req.query.sortBy) || -1; // Default to newest

    delete query.page;
    delete query.sortBy;

    if (query.status === "") {
      query.status = {
        $regex: `.*Open.*|.*Close.*|.*Canceled.*|.*On Hold.*`,
        $options: "i",
      };
    }

    // Remove fields with empty strings
    Object.keys(query).forEach((key) => {
      if (query[key] === "") {
        delete query[key];
      }
    });

    // Handle search
    if (query.search) {
      const escapedSearch = escapeRegex(query.search);
      query.$or = [
        { title: { $regex: `.*${escapedSearch}.*`, $options: "i" } },
        { description: { $regex: `.*${escapedSearch}.*`, $options: "i" } },
      ];
      delete query.search;
    }

    // Additional filters with regex for partial matching
    ["title", "jobCategory", "description", "company"].forEach((field) => {
      if (query[field]) {
        query[field] = {
          $regex: `.*${escapeRegex(query[field])}.*`,
          $options: "i",
        };
      }
    });

    // Handle applicationDeadline as a date filter
    if (query.applicationDeadline) {
      const deadlineDate = new Date(query.applicationDeadline);
      if (!isNaN(deadlineDate)) {
        query.applicationDeadline = { $gte: deadlineDate };
      }
    }

    // Pagination calculations
    const totalJobs = await jobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await jobListing
      .find(query)
      .sort({ datePosted: sortBy })
      .skip((page - 1) * limit)
      .limit(limit);

    res.send({ jobs, totalPages });
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Helper Function to Escape Regex Special Characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Delete job listing
exports.deleteJobListing = async (req, res) => {
  const { _id } = req.params;
  try {
    // Check if the job exists
    const job = await jobListing.findByIdAndDelete(_id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Remove the job ID from all profiles' savedJobs
    await Profile.updateMany(
      { savedJobs: _id }, // Find profiles where savedJobs contains the job ID
      { $pull: { savedJobs: _id } } // Remove the job ID from savedJobs
    );

    // Delete all applications related to the job
    await Application.deleteMany({ jobId: _id });

    res.json({ msg: "Job successfully deleted!" });
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] }); // Use 500 for server errors
  }
};

// Update job listing
exports.updateJobListing = async (req, res) => {
  console.log("updateJobListing called: ", req.body);
  const { _id } = req.params;

  try {
    // Check if the job exists
    const job = await jobListing.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    console.log("Job updated successfully returning: ", job);
    res.json(job);
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
    console.log("Error updating job: ", err);
  }
};

// Get jobs by employer
exports.getJobsByEmployer = async (req, res) => {
  const employerId = req.params.employerId;
  try {
    // Create a copy of the query
    const query = { ...req.query };
    const limit = parseInt(req.query.limit) || 40; // Allow limit to be set via query
    const page = parseInt(req.query.page) || 1; // Retrieve page from query
    const sortBy = parseInt(req.query.sortBy) || -1; // Default to newest

    delete query.page;
    delete query.sortBy;

    // Remove fields with empty strings
    Object.keys(query).forEach((key) => {
      if (query[key] === "") {
        delete query[key];
      }
    });

    // Handle search
    if (query.search) {
      const escapedSearch = escapeRegex(query.search);
      query.$or = [
        { title: { $regex: `.*${escapedSearch}.*`, $options: "i" } },
        { description: { $regex: `.*${escapedSearch}.*`, $options: "i" } },
      ];
      delete query.search;
    }

    // Additional filters with regex for partial matching
    ["title", "jobCategory", "description", "company"].forEach((field) => {
      if (query[field]) {
        query[field] = {
          $regex: `.*${escapeRegex(query[field])}.*`,
          $options: "i",
        };
      }
    });

    // Handle applicationDeadline as a date filter
    if (query.applicationDeadline) {
      const deadlineDate = new Date(query.applicationDeadline);
      if (!isNaN(deadlineDate)) {
        query.applicationDeadline = { $gte: deadlineDate };
      }
    }

    query.employer = employerId;

    // Pagination calculations
    const totalJobs = await jobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await jobListing
      .find(query)
      .sort({ datePosted: sortBy })
      .skip((page - 1) * limit)
      .limit(limit);

    res.send({ jobs, totalPages });
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Create Job Listing
exports.createJob = [
  createJobValidationRules,
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employer,
      title,
      description,
      company,
      location,
      jobCategory,
      requirements,
      benefits,
      salaryRange,
      employmentType,
      applicationDeadline,
      status,
      questions, 
    } = req.body;

    try {
      let joblisting = await jobListing.findOne({
        employer,
        title,
        description,
        company,
        location,
        jobCategory,
        requirements,
        benefits,
        salaryRange,
        employmentType,
        applicationDeadline,
        status,
      });

      // Check if identical job listing already exists
      if (joblisting) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Identical job listing already exists" }] });
      }

      joblisting = new jobListing({
        employer,
        title,
        description,
        company,
        location,
        jobCategory,
        requirements,
        benefits,
        salaryRange,
        employmentType,
        applicationDeadline,
        status,
        questions, 
      });
      await joblisting.save();

      res.status(200).json({ success: true });
    } catch (err) {
      // Handle server error
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  },
];

// Add or update questions for a specific job listing
exports.addJobQuestions = async (req, res) => {
  const { jobId } = req.params;
  const { questions } = req.body;

  try {
    // Find the job listing by ID
    const job = await jobListing.findById(jobId);

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Update the job listing's questions
    job.questions = questions;

    await job.save();

    res.json({ success: true, job });
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getJobDetails = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await jobListing.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};


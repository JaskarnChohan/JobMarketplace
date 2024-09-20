const jobListing = require("../models/jobListing.js");
const application = require("../models/application.js");
const { validationResult, check } = require("express-validator");
const mongoose = require("mongoose");

// George Haeberlin: Create Job Listing Validation rules
const createJobValidationRules = [
  check("title", "Please provide a valid title").notEmpty().isString(),
  check("description", "Please enter a description").notEmpty(),
  check("location", "Please enter a location").notEmpty(),
  check("jobCategory", "Please select a job category").notEmpty(),
  check("salaryRange", "Please select a salary range").notEmpty(),
  check("employmentType", "Please select an employment type").notEmpty(),
  check(
    "applicationDeadline",
    "Please enter an application deadline"
  ).notEmpty(),
];

exports.getLatestJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
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

    // // Optional: Add case-insensitive search for certain fields
    // if (query.title && query.search) {
    //   query.title = { $regex: `.*${escapeRegex(query.title)}.*|.*${escapeRegex(query.search)}.*`, $options: 'i' }; // Case-insensitive
    // } else if (query.search) {
    //   query.title = { $regex: `.*${escapeRegex(query.search)}.*`, $options: 'i' }; // Case-insensitive
    // }

    // if (query.description && query.search) {
    //   query.description = { $regex: `.*${query.description}.*|.*${query.search}.*`, $options: 'i' }; // Case-insensitive
    // } else if (query.search) {
    //   query.description = { $regex: `.*${query.search}.*`, $options: 'i' }; // Case-insensitive
    // }

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

    console.log("Received query:", query); // Add this line

    // Pagination calculations
    const totalJobs = await jobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await jobListing
      .find(query)
      .sort({ datePosted: sortBy }) // Assuming 'datePosted' exists
      .skip((page - 1) * limit)
      .limit(limit);

    res.send({ jobs, totalPages });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Helper Function to Escape Regex Special Characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.createApplication = async (req, res) => {
  console.log("createApplication called");
  // Convert the IDs to ObjectId type
  const jobId = req.body.jobId;
  const userId = req.body.userId;

  // Validate if jobId and userId are valid ObjectIds
  if (
    !mongoose.Types.ObjectId.isValid(jobId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ msg: "Invalid jobId or userId format" });
  }

  console.log(`User Id: ${userId}, Listing Id: ${jobId}`);

  try {
    // Create a new application with the valid ObjectId fields
    const newApplication = new application({
      job: new mongoose.Types.ObjectId(jobId), // Assign jobId to the 'job' field
      user: new mongoose.Types.ObjectId(userId), // Assign userId to the 'user' field
    });

    await newApplication.save(); // Save the application to the database

    res.status(200).json({ msg: "Application successfully created!" });
  } catch (error) {
    console.error("Error creating application:", error);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.deleteJobListing = async (req, res) => {
  console.log("deleteJobListing called");
  const { _id } = req.params;
  console.log(`Recieved id: ${_id}`);
  try {
    const job = await jobListing.findByIdAndDelete(_id);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    res.json({ msg: "Job successfully deleted!" });
  } catch (err) {
    console.error(err.message);
    res.status(404).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.updateJobListing = async (req, res) => {
  console.log("updateJobListing called");
  const { _id } = req.params;
  console.log(`Updating job id: ${_id}`);
  console.log(req.body);
  try {
    const job = await jobListing.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error("Error in updateJobListing:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// New controller function to get unique companies
exports.getUniqueCompanies = async (req, res) => {
  try {
    const uniqueCompanies = await jobListing.distinct("company");
    res.send({ companies: uniqueCompanies });
  } catch (err) {
    console.error("Error in getUniqueCompanies:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// New controller function to get unique companies
exports.getUniqueCategories = async (req, res) => {
  try {
    const uniqueCategories = await jobListing.distinct("jobCategory");
    res.send({ categories: uniqueCategories });
  } catch (err) {
    console.error("Error in getUniqueCategories:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getJobsByEmployer = async (req, res) => {
  console.log("getJobsByEmployer called");
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

    console.log("Received query:", query); // Add this line

    // Pagination calculations
    const totalJobs = await jobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await jobListing
      .find(query)
      .sort({ datePosted: sortBy }) // Assuming 'datePosted' exists
      .skip((page - 1) * limit)
      .limit(limit);
    res.send({ jobs, totalPages });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getJobDetails = async (req, res) => {
  console.log("getJobDetails called");
  const jobId = req.params.jobId;
  try {
    console.log("Received job id:", jobId); // Add this line
    const job = await jobListing.findById(jobId);
    if (!job) {
      console.log("job not found!");
      return res.status(404).json({ errors: [{ msg: "Job not found" }] });
    }
    res.send(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// George Haeberlin: Create Job Listing
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
      });
      await joblisting.save();

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  },
];

exports.applyToJob = (req, res) => {
  res.send("Placeholder for applyToJob function");
};

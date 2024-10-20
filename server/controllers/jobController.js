const JobListing = require("../models/jobListing.js");
const Notification = require("../models/notification.js");
const Profile = require("../models/profile"); // Import the Profile model
const CompanyProfile = require("../models/companyProfile"); // Import the CompanyProfile model
const Application = require("../models/application"); // Import the Application model
const AiController = require("./aiController"); // Import the AiController
const { validationResult, check } = require("express-validator");

// Create Job Listing Validation rules
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

    const totalJobs = await JobListing.countDocuments(query);
    const jobs = await JobListing.find(query)
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
    const totalJobs = await JobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await JobListing.find(query)
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
    const job = await JobListing.findByIdAndDelete(_id);
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
  const { _id } = req.params;

  try {
    // Check if the job exists
    const job = await JobListing.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }

    // Check if a new question was explicitly added by the `isNewQuestion` flag
    if (req.body.isNewQuestion) {
      const notificationMessage = `A new question was added to the job listing "${job.title}".`;

      const notification = new Notification({
        user: job.employer, // The employer receives the notification
        message: notificationMessage, // Notification message
        type: "QUESTION", // Type of notification
      });

      await notification.save(); // Save the notification
    }

    // If a question was answered, send a notification to the question author
    if (req.body.answeredQuestionAuthor) {
      const notificationMessage = `Your question on the job listing "${job.title}" has been answered.`;

      const notification = new Notification({
        user: req.body.answeredQuestionAuthor, // The question's author receives the notification
        message: notificationMessage, // Notification message
        type: "ANSWER", // Type of notification for an answered question
      });

      await notification.save(); // Save the notification
    }
    res.json(job);
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
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
    const totalJobs = await JobListing.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = await JobListing.find(query)
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
      // Check if identical job listing already exists
      let existingJob = await JobListing.findOne({
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

      if (existingJob) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Identical job listing already exists" }] });
      }

      // Create new job listing
      const newJobListing = new JobListing({
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

      await newJobListing.save();

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err.message);
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
    const job = await JobListing.findById(jobId);

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
    const job = await JobListing.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Controller to get recommended jobs based on user profile
exports.getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.user.id; // Get the user ID from the authenticated request

    // Fetch user profile using userId
    const userProfile = await Profile.findOne({ user: userId }).populate(
      "user"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // Extract preferred classification and home location
    const { preferredClassification, homeLocation } = userProfile;

    // Find job listings that match the preferred classification and location
    const matchingJobs = await JobListing.find({
      jobCategory: preferredClassification,
      location: homeLocation,
    }).populate("employer"); // Ensure you have the employer populated correctly

    // Fetch applications submitted by the user
    const userApplications = await Application.find({ userId }).select("jobId");

    // Extract job IDs from applications
    const appliedJobIds = userApplications.map((application) =>
      application.jobId.toString()
    );

    // Filter out jobs that the user has already applied to
    let recommendedJobs = matchingJobs.filter(
      (job) => !appliedJobIds.includes(job._id.toString())
    );

    // If there are not enough recommended jobs (less than 9), fetch additional jobs
    if (recommendedJobs.length < 9) {
      if (preferredClassification) {
        const additionalJobs = await JobListing.find({
          jobCategory: preferredClassification,
          _id: {
            $nin: [
              ...appliedJobIds,
              ...recommendedJobs.map((job) => job._id.toString()),
            ],
          }, // Exclude already applied and already recommended jobs
        })
          .limit(9 - recommendedJobs.length) // Limit to the number needed to reach 9
          .populate("employer");

        // Combine recommended and additional jobs
        recommendedJobs.push(...additionalJobs);
      }
    }

    // If there are still no recommended jobs after filtering, return a message
    if (recommendedJobs.length === 0) {
      return res.status(200).json({ message: "No recommended jobs available" });
    }

    // Evaluate the recommended jobs
    const evaluations = await AiController.evaluateRecommendedJobs(
      userId,
      recommendedJobs,
      homeLocation // Pass home location to AI evaluation
    );

    // Fetch company profiles for employers
    const employerIds = recommendedJobs.map((job) => job.employer);
    const companyProfiles = await CompanyProfile.find({
      user: { $in: employerIds },
    });

    // Create a map of employer IDs to names
    const employerMap = {};
    companyProfiles.forEach((profile) => {
      employerMap[profile.user.toString()] = profile.name;
    });

    // Combine job details with evaluation scores and employer names
    const detailedRecommendations = evaluations
      .map((evaluation) => {
        const job = recommendedJobs.find(
          (job) => job._id.toString() === evaluation.jobId.toString()
        );

        // Ensure job is defined and has a valid ID
        if (!job || !job._id) {
          console.error("Job is undefined or does not have a valid ID");
          return null; // Handle the case where job might not be found
        }

        return {
          jobId: job._id,
          title: job.title,
          employer: job.employer,
          company: employerMap[job.employer] || "Unknown",
          location: job.location,
          salaryRange: job.salaryRange,
          employmentType: job.employmentType,
          score: evaluation.score,
        };
      })
      .filter(Boolean); // Filter out any null values

    // Sort evaluations by score in descending order
    detailedRecommendations.sort((a, b) => b.score - a.score);

    // Return the top jobs based on the highest scores, limiting to 9
    return res.status(200).json(detailedRecommendations.slice(0, 9));
  } catch (error) {
    console.error("Error fetching recommended jobs:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

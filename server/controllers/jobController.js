const jobListing = require("../models/jobListing.js");
const { validationResult, check, body } = require("express-validator");
const sendTokenResponse = require("../utils/sendTokenResponse");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { URL } = require("url");

// George Haeberlin: Create Job Listing Validation rules
const createJobValidationRules = [
  check("title", "Please provide a valid title")
    .notEmpty()
    .isString(),
  check("description", "Please enter a description").notEmpty(),

];

exports.getJobs = async (req, res) => {
  try {
    let joblistings = await jobListing.find();
    res.send(joblistings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getJobDetails = (req, res) => {
  res.send("Placeholder for getJobDetails function");
};

// George Haeberlin: Create Job Listing
exports.createJob = [
  createJobValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employer, title, description, company, location, 
      jobCategory, requirements, benefits, salaryRange, employmentType,
      applicationDeadline, status } = req.body;
    try {
      let joblisting = await jobListing.findOne({ employer, title, description, company, location, 
        jobCategory, requirements, benefits, salaryRange, employmentType,
        applicationDeadline, status });
      
      if (joblisting) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Identical job listing already exists" }] });
      }

      joblisting = new jobListing({ employer, title, description, company, location, 
        jobCategory, requirements, benefits, salaryRange, employmentType,
        applicationDeadline, status });
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

const mongoose = require("mongoose");

const jobListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProfile",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String], // An array of strings to list job requirements
      required: true,
    },
    benefits: {
      type: [String], // An array of strings to list job benefits
    },
    salaryRange: {
      type: String,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Temporary", "Internship"],
      required: true,
    },
    datePosted: {
      type: Date,
      default: Date.now,
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "On Hold", "Canceled"],
      default: "Open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobListing", jobListingSchema);

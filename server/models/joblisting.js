const mongoose = require("mongoose");

const jobListingSchema = new mongoose.Schema(
  {
    employer: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    company: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: true,
    },
    jobCategory: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String], // An array of strings to list job requirements
      default: [],
    },
    benefits: {
      type: [String], // An array of strings to list job benefits
      default: [],
    },
    salaryRange: {
      type: String,
      enum: [
        "$0-$10,000",
        "$10,000-$20,000",
        "$20,000-$40,000",
        "$40,000-$60,000",
        "$60,000-$80,000",
        "$80,000-$100,000",
        "$100,000-$120,000",
        "$120,000-$140,000",
        "$140,000-$160,000",
        "$160,000-$180,000",
        "$180,000-$200,000",
        "$200,000+",
      ],
      required: true,
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
      required: true,
    },
    status: {
      type: String,
      enum: ["Open", "Closed", "On Hold", "Cancelled", "Draft"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobListing", jobListingSchema);

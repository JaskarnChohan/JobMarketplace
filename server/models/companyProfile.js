const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      unique: true,
    },
    companyLogo: {
      type: String,
      default: "default-logo.png", // Default logo if none is provided
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
    },
    websiteURL: {
      type: String,
      required: [true, "Website URL is required"],
      validate: {
        validator: function (v) {
          return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid URL!`,
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /\d{10}/.test(v); // Simple example for a 10-digit number
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    companySize: {
      type: String,
      enum: ["Small", "Medium", "Large"], // You can categorize companies by size
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: 3, // Default rating value
    },
  },
  { timestamps: true }
);

// Virtual to count number of jobs posted by the company (if job collection exists)
companyProfileSchema.virtual("jobCount", {
  ref: "Job", // Assuming you have a Job schema
  localField: "_id",
  foreignField: "company",
  count: true,
});

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);

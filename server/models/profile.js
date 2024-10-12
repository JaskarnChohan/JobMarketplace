const mongoose = require("mongoose");

// Define the profile schema
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    homeLocation: {
      type: String,
      required: true,
    },
    preferredClassification: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
    },
    resume: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 600,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    resumePrivacy: {
      type: String,
      enum: ["public", "private"], // Define allowed values
      default: "private", // Set default privacy level
    },
    savedJobs: {
      // Define the savedJobs field
      type: [String],
      default: [],
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyReview", // Reference to the company reviews
      },
    ],
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Profile", profileSchema);

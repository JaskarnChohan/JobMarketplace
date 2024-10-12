const mongoose = require("mongoose");

// Define the company review schema
const userReviewSchema = new mongoose.Schema(
  {
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "profile", // Reference to the profile
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who made the review
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1, // Minimum rating
      max: 5, // Maximum rating
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000, // Maximum length for the review content
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Export the model
module.exports = mongoose.model("UserReviews", userReviewSchema);

const mongoose = require("mongoose");

// Define the company review schema
const companyReviewSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companyProfile", // Reference to the company profile
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
module.exports = mongoose.model("CompanyReview", companyReviewSchema);

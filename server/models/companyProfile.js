const mongoose = require("mongoose");

// Define the company profile schema
const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    logo: String,
    description: {
      type: String,
      maxlength: 10000,
    },
    location: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    websiteURL: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyReview", // Reference to the company reviews
      },
    ],
    posts: {
      type: [
        {
          title: {
            type: String,
            required: true,
          },
          body: {
            type: String,
            required: true,
          },
          date: {
            type: Date,
            default: Date.now,
          },
          votes: {
            type: [
              {
                voter: {
                  type: String,
                  required: true,
                },
                vote: {
                  type: Number,
                  required: true,
                },
              },
            ],
          },
        },
      ],
    },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("companyProfile", companyProfileSchema);

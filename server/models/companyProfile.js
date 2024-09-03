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
      required: true,
      unique: true,
    },
    companyLogo: {
      type: String,
    },
    description: {
      type: String,
      maxlength: 1000,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);

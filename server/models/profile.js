const mongoose = require("mongoose");

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
      enum: [
        "Accounting",
        "Administration & Office Support",
        "Advertising, Arts & Media",
        "Banking & Financial Services",
        "Call Centre & Customer Service",
        "CEO & General Management",
        "Community Services & Development",
        "Construction",
        "Consulting & Strategy",
        "Design & Architecture",
        "Education & Training",
        "Engineering",
        "Farming, Animals & Conservation",
        "Government & Defence",
        "Healthcare & Medical",
        "Hospitality & Tourism",
        "Human Resources & Recruitment",
        "Information & Communication Technology",
        "Insurance & Superannuation",
        "Legal",
        "Manufacturing, Transport & Logistics",
        "Marketing & Communications",
        "Mining, Resources & Energy",
        "Real Estate & Property",
        "Retail & Consumer Products",
        "Sales",
        "Science & Technology",
        "Self Employment",
        "Sport & Recreation",
        "Trades & Services",
      ],
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);

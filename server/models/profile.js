const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    profilePhoto: {
      type: String, 
    },
    cvFile: {
      type: String, 
    },
    skills: [String], 
    education: [
      {
        school: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    jobPreferences: {
      type: String,
    },
    experience: [
      {
        title: String,
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    certifications: [String], 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);

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
      type: String, // Store the URL or path to the profile photo
    },
    cvFile: {
      type: String, // Store the URL or path to the CV file
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);

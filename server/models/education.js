const mongoose = require("mongoose");

// Define an array of valid 3-character month abbreviations
const validMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Define the experience schema
const educationSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    fieldOfStudy: {
      type: String,
      required: true,
    },
    startMonth: {
      type: String,
      required: true,
      enum: validMonths, // Restrict the value to valid 3-character month abbreviations
      validate: {
        validator: function (value) {
          return validMonths.includes(value); // Ensure the month is valid
        },
        message: "Start month must be a valid 3-character month abbreviation",
      },
    },
    startYear: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{4}$/.test(value); // Validate year is in YYYY format
        },
        message: "Start year must be a valid 4-digit year",
      },
    },
    endMonth: {
      type: String,
      enum: validMonths, // Restrict the value to valid 3-character month abbreviations
      validate: {
        validator: function (value) {
          return value === null || validMonths.includes(value); // Allow null or valid month
        },
        message: "End month must be a valid 3-character month abbreviation",
      },
    },
    endYear: {
      type: Number,
      validate: {
        validator: function (value) {
          return value === null || /^\d{4}$/.test(value); // Allow null or valid year
        },
        message: "End year must be a valid 4-digit year",
      },
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Education", educationSchema);

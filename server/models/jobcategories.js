const mongoose = require("mongoose");

const jobcategoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
        type: String,
        required: true,
        unique: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Jobcategories", jobcategoriesSchema);

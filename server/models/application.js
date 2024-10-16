const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobListing",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
    default: "Pending",
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  questions: [
    {
      question: { type: String, required: true }, // Store the question
      userAnswer: { type: String, required: true }, // Store the user's answer
    },
  ],
  aiEvaluation: {
    score: { type: String }, // Format: "<score>/100"
    evaluation: { type: String }, // AI's evaluation as plain text
    recommendedOutcome: {
      type: String,
    },
  },
});

// Export the model
module.exports = mongoose.model("Application", applicationSchema);

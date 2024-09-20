const mongoose = require("mongoose");

// Define the skill schema
const skillSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Export the model
module.exports = mongoose.model("Skill", skillSchema);

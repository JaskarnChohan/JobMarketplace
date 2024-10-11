// Import necessary modules
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: { type: String, enum: ["jobSeeker", "employer"], required: true },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastPasswordResetRequest: Date,

    // New subscription fields
    subscription: {
      type: {
        type: String,
        enum: ["Free", "AI Plan"],
        default: "Free",
      },
      startDate: { type: Date },
      status: {
        type: String,
        enum: ["active", "canceled", "expired"],
        default: "active",
      },
      agreementId: { type: String }, // To store PayPal agreement ID
    },
  },
  { timestamps: true, versionKey: false }
);

// Middleware to hash the password before saving the user to the database
userSchema.pre("save", async function (next) {
  // Check if password is modified or it's a new user
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
  }
  next(); // Continue with the save operation
});

// Method to compare the entered password with the hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Compare the passwords
};

// Method to generate a signed JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    // Sign the token
    expiresIn: process.env.JWT_EXPIRE, // Set the expiration
  });
};

// Export the user model
module.exports = mongoose.model("User", userSchema);

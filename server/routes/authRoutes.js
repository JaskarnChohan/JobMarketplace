// Import necessary modules
const express = require("express");
const {
  register,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  getUserInformation,
  getUserIdByEmail,
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router(); // Create a new router instance

// Auth routes

// Route for user registration
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route for user logout
router.post("/logout", logout);

// Route to request a password reset link
router.post("/request-password-reset", requestPasswordReset);

// Route to reset the user's password
router.post("/reset-password", resetPassword);

// Route to validate the password reset token
router.post("/validate-reset-token", validateResetToken);

// Route to fetch user information for the authenticated user
router.get("/user-info", authenticate, getUserInformation);

// Route to fetch user ID by email
router.get("/getIdByEmail/:email", getUserIdByEmail);

// Export the router for use in other modules
module.exports = router;

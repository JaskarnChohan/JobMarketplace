const express = require("express");
const {
  register,
  createjob,
  login,
  logout,
  getUserProfile,
  requestPasswordReset,
  resetPassword,
  validateResetToken,
  getUserInformation,
} = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/createjob", createjob);
router.post("/login", login);
router.post("/logout", logout);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/validate-reset-token", validateResetToken);
router.get("/user-info", authenticate, getUserInformation);

module.exports = router;

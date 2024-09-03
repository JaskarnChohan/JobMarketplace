const express = require("express");
const {
  getUserProfile,
  updateUserProfile,
  getCompanyProfile,
  updateCompanyProfile,
} = require("../controllers/profileController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/user/:userId", authenticate, getUserProfile);
router.put("/user/:userId", authenticate, updateUserProfile);
router.get("/company/:companyId", authenticate, getCompanyProfile);
router.put("/company/:companyId", authenticate, updateCompanyProfile);

module.exports = router;

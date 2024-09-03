const express = require("express");
const {
  getUserSettings,
  updateUserSettings,
  getCompanySettings,
  updateCompanySettings,
} = require("../controllers/settingsController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/user/:userId", authenticate, getUserSettings);
router.put("/user/:userId", authenticate, updateUserSettings);
router.get("/company/:companyId", authenticate, getCompanySettings);
router.put("/company/:companyId", authenticate, updateCompanySettings);

module.exports = router;

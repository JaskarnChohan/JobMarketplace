const express = require("express");
const router = express.Router();
const {
  createCompanyProfile,
  getAllCompanyProfiles,
  getCompanyProfileById,
  updateCompanyProfile,
  deleteCompanyProfile,
} = require("../controllers/companyProfileController");

router.post("/", createCompanyProfile);
router.get("/", getAllCompanyProfiles);
router.get("/:id", getCompanyProfileById);
router.put("/:id", updateCompanyProfile);
router.delete("/:id", deleteCompanyProfile);

module.exports = router;

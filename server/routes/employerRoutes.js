const express = require("express");
const {
  getEmployers,
  getEmployerProfile,
} = require("../controllers/employerController");

const router = express.Router();

router.get("/", getEmployers);
router.get("/:employerId", getEmployerProfile);

module.exports = router;

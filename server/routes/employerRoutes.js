// Import necessary modules
const express = require("express");
const router = express.Router();
const employerController = require("../controllers/employerController");
const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

// Route for creating a new company profile
router.post("/create", authenticate, employerController.createCompanyProfile);

// Route for fetching the company profile of the logged-in user
router.get(
  "/profile/fetch",
  authenticate,
  employerController.getCompanyProfile
);

// Route for updating the company profile of the logged-in user
router.put("/update/:profileId", authenticate, employerController.updateCompanyProfileById);
router.put("/update", authenticate, employerController.updateCompanyProfile);

// Route for updating the company logo of the logged-in user
router.post(
  "/update-logo",
  authenticate,
  upload.single("logo"),
  employerController.updateCompanyLogo
);

// Route for adding a review
router.post("/reviews/add/:id", authenticate, employerController.createReview);

// Route for editing a review
router.put(
  "/reviews/edit/:reviewId",
  authenticate,
  employerController.editReview
);

// Route for deleting a review
router.delete(
  "/reviews/delete/:reviewId",
  authenticate,
  employerController.deleteReview
);

// Route for fetching company reviews
router.get("/reviews/:companyId/", employerController.getCompanyReviews);

// Route for fetching a specific company profile by its ID
router.get("/profile/fetch/:id", employerController.getCompanyProfileById);

// Route for fetching a list of all employers
router.get("/", employerController.getEmployers);

// Export the router for use in other modules
module.exports = router;

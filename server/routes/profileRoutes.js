// Import necessary modules
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const experienceController = require("../controllers/experienceController");
const educationController = require("../controllers/educationController");
const skillController = require("../controllers/skillController");
const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

// Profile routes
router.post("/create", authenticate, profileController.createProfile); // Create a new profile
router.put("/update/:profileId", authenticate, profileController.updateProfileById); // Update existing profile by id
router.put("/update", authenticate, profileController.updateProfile); // Update existing profile
router.get("/fetch", authenticate, profileController.getProfile); // Fetch the profile
router.put("/updateSavedJobs", authenticate, profileController.updateSavedJobs); // Save a job
router.get("/getSavedJobs", authenticate, profileController.getSavedJobs); // Fetch saved jobs
router.post(
  "/update-picture",
  authenticate,
  upload.single("profilePicture"),
  profileController.updateProfilePicture // Update profile picture
);
router.post(
  "/resume/upload",
  authenticate,
  upload.single("resume"),
  profileController.updateResume // Upload resume
);
router.get("/resume/fetch", authenticate, profileController.getResume); // Fetch resume
router.delete("/resume/delete", authenticate, profileController.deleteResume); // Delete resume
// Route for Updating Resume Privacy
router.put(
  "/resume/privacy",
  authenticate,
  profileController.updateResumePrivacy // Update resume privacy
);

// Fetch profile by user ID
router.get("/user/:userId", profileController.getProfileByUserId); // Fetch profile by user ID

// Experience routes
router.post(
  "/:profileId/experience/create",
  authenticate,
  experienceController.createExperience // Create new experience entry
);
router.put(
  "/:profileId/experience/:id/update",
  authenticate,
  experienceController.updateExperience // Update experience entry
);
router.delete(
  "/:profileId/experience/:id/delete",
  authenticate,
  experienceController.deleteExperience // Delete experience entry
);
router.get(
  "/:profileId/experience/fetch",
  authenticate,
  experienceController.getExperience // Fetch experience entries
);

// Education routes
router.post(
  "/:profileId/education/create",
  authenticate,
  educationController.createEducation // Create new education entry
);
router.put(
  "/:profileId/education/:id/update",
  authenticate,
  educationController.updateEducation // Update education entry
);
router.delete(
  "/:profileId/education/:id/delete",
  authenticate,
  educationController.deleteEducation // Delete education entry
);
router.get(
  "/:profileId/education/fetch",
  authenticate,
  educationController.getEducation // Fetch education entries
);

// Skills routes
router.post(
  "/:profileId/skill/create",
  authenticate,
  skillController.createSkill // Create new skill entry
);
router.put(
  "/:profileId/skill/:id/update",
  authenticate,
  skillController.updateSkill // Update skill entry
);
router.delete(
  "/:profileId/skill/:id/delete",
  authenticate,
  skillController.deleteSkill // Delete skill entry
);
router.get("/:profileId/skill/fetch", authenticate, skillController.getSkills); // Fetch skills

// Export the router for use in other modules
module.exports = router;

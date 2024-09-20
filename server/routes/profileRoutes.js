const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const experienceController = require("../controllers/experienceController");
const educationController = require("../controllers/educationController");
const skillController = require("../controllers/skillController");
const authenticate = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

// Profile routes
router.post("/create", authenticate, profileController.createProfile);
router.put("/update", authenticate, profileController.updateProfile);
router.get("/fetch", authenticate, profileController.getProfile);
router.post(
  "/update-picture",
  authenticate,
  upload.single("profilePicture"),
  profileController.updateProfilePicture
);

router.post(
  "/resume/upload",
  authenticate,
  upload.single("resume"),
  profileController.updateResume
);

router.get("/resume/fetch", authenticate, profileController.getResume);

router.delete("/resume/delete", authenticate, profileController.deleteResume);


// Fetch profile by user ID
router.get("/user/:userId", profileController.getProfileByUserId);
// Experience routes
router.post(
  "/:profileId/experience/create",
  authenticate,
  experienceController.createExperience
);
router.put(
  "/:profileId/experience/:id/update",
  authenticate,
  experienceController.updateExperience
);
router.delete(
  "/:profileId/experience/:id/delete",
  authenticate,
  experienceController.deleteExperience
);
router.get(
  "/:profileId/experience/fetch",
  authenticate,
  experienceController.getExperience
);

// Education routes
router.post(
  "/:profileId/education/create",
  authenticate,
  educationController.createEducation
);
router.put(
  "/:profileId/education/:id/update",
  authenticate,
  educationController.updateEducation
);
router.delete(
  "/:profileId/education/:id/delete",
  authenticate,
  educationController.deleteEducation
);
router.get(
  "/:profileId/education/fetch",
  authenticate,
  educationController.getEducation
);

// Skills routes
router.post(
  "/:profileId/skill/create",
  authenticate,
  skillController.createSkill
);
router.put(
  "/:profileId/skill/:id/update",
  authenticate,
  skillController.updateSkill
);
router.delete(
  "/:profileId/skill/:id/delete",
  authenticate,
  skillController.deleteSkill
);
router.get("/:profileId/skill/fetch", authenticate, skillController.getSkills);

module.exports = router;

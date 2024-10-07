const Profile = require("../models/profile");
const Skill = require("../models/skill");
const Experience = require("../models/experience");
const Education = require("../models/education");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

// Fetch profile data
exports.getProfile = async (req, res) => {
  try {
    // Check if the profile exists
    const profile = await Profile.findOne({ user: req.user.id });

    // If profile is not found, return a default profile with a flag indicating no profile exists
    if (!profile) {
      return res.json({
        profile: null,
        email: null,
        profilePicture: "uploads/profile-pictures/default.png",
        profileExists: false,
      });
    }

    // Fetch user's email
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    // Set default profile picture if not set
    const profilePicture =
      profile.profilePicture || "uploads/profile-pictures/default.png";

    // Return the profile data
    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
      profileExists: true,
    };

    res.json(profileWithEmail);
  } catch (err) {
    // Handle server error
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Create profile
exports.createProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      homeLocation,
      phoneNumber,
      bio,
      preferredClassification,
    } = req.body;

    const profile = new Profile({
      user: req.user.id,
      firstName,
      lastName,
      homeLocation,
      phoneNumber,
      bio,
      preferredClassification,
    });

    await profile.save();

    // Fetch user's email
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    // Set default profile picture if not set
    const profilePicture = "uploads/profile-pictures/default.png";

    // Return the profile data
    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
    };

    res.json(profileWithEmail);
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      homeLocation,
      phoneNumber,
      bio,
      preferredClassification,
    } = req.body;

    // Find the user's profile
    let profile = await Profile.findOne({ user: req.user.id });

    // If profile is not found, return an error
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    // Update the profile fields
    profile.firstName = firstName || profile.firstName;
    profile.lastName = lastName || profile.lastName;
    profile.homeLocation = homeLocation || profile.homeLocation;
    profile.phoneNumber = phoneNumber || profile.phoneNumber;
    profile.bio = bio || profile.bio;
    profile.preferredClassification =
      preferredClassification || profile.preferredClassification;

    await profile.save();

    // Fetch user's email
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    // Set default profile picture if not set
    const profilePicture =
      profile.profilePicture || "uploads/profile-pictures/default.png";

    // Return the profile data
    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
    };

    res.json(profileWithEmail);
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: "No file uploaded" }] });
    }

    // Find the user's profile
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    // Save the new profile picture
    const oldProfilePicturePath = profile.profilePicture;
    profile.profilePicture = req.file.path;
    await profile.save();

    // Delete the old profile picture
    if (oldProfilePicturePath && fs.existsSync(oldProfilePicturePath)) {
      fs.unlinkSync(oldProfilePicturePath);
    }

    // Fetch the user's email
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    // Respond with success
    res.json({
      msg: "Profile picture updated",
      profilePicture: profile.profilePicture,
      email: user.email,
    });
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update Resume
exports.updateResume = async (req, res) => {
  try {
    const { privacySetting = "private" } = req.body; // Default to "private" if not provided
    const profile = await Profile.findOne({ user: req.user.id });

    // Check if the profile exists
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    // Delete the old resume if it exists
    if (profile.resume) {
      const oldResumePath = path.resolve(
        __dirname,
        "..",
        "uploads",
        profile.resume
      );

      // Check if the file exists
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    // Save the new resume and privacy setting
    profile.resume = req.file.path;
    profile.resumePrivacy = privacySetting; // Set privacy based on request
    await profile.save();

    res.status(200).json({
      message: "Resume updated successfully",
      resume: profile.resume,
      resumePrivacy: profile.resumePrivacy, // Return the updated privacy setting
    });
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get Resume
exports.getResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Check if the profile exists
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    // Check privacy setting
    if (!profile.resume) {
      return res
        .status(200)
        .json({ resume: null, message: "Resume is not uploaded" });
    }

    // Get the resume filename
    const resumeFilename = profile.resume;

    // Check if the file exists
    if (fs.existsSync(resumeFilename)) {
      return res.status(200).json({
        resume: resumeFilename,
        privacySetting: profile.resumePrivacy,
      });
    } else {
      return res
        .status(404)
        .json({ resume: null, message: "Resume file not found" });
    }
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Delete Resume
exports.deleteResume = async (req, res) => {
  try {
    // Find the user's profile
    const profile = await Profile.findOne({ user: req.user.id });

    // Check if the profile exists
    if (!profile || !profile.resume) {
      return res.status(404).json({ errors: [{ msg: "Resume not found" }] });
    }

    // Delete the resume file
    const resumePath = path.resolve(profile.resume);
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    // Remove the resume reference from the profile
    profile.resume = null;
    await profile.save();

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};
// Fetch profile by user ID
exports.getProfileByUserId = async (req, res) => {
  try {
    // Fetch the profile using the user ID
    const profile = await Profile.findOne({ user: req.params.userId });

    // If profile is not found, return a default profile with a flag indicating no profile exists
    if (!profile) {
      return res.json({
        profile: null,
        email: null,
        profilePicture: "uploads/profile-pictures/default.png",
        profileExists: false,
        skills: [],
        education: [],
        experience: [],
      });
    }

    // Fetch user's email
    const user = await User.findById(req.params.userId).select("email");

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    // Set default profile picture if not set
    const profilePicture =
      profile.profilePicture || "uploads/profile-pictures/default.png";

    // Fetch related skills, education, and experience
    const skills = await Skill.find({ profile: profile._id });
    const education = await Education.find({ profile: profile._id });
    const experience = await Experience.find({ profile: profile._id });

    // Return the profile data with related skills, education, and experience
    const profileWithDetails = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
      profileExists: true,
      skills,
      education,
      experience,
    };
    res.json(profileWithDetails);
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update Resume Privacy
exports.updateResumePrivacy = async (req, res) => {
  try {
    const { privacySetting } = req.body; // Get the new privacy setting
    const userId = req.user.id; // Get the user ID from the authenticated request

    // Find the user's profile and update the resume privacy setting
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId }, // Search by user ID in the profile
      { resumePrivacy: privacySetting }, // Update privacy setting, converting to boolean
      { new: true } // Return the updated document
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.status(200).json({
      message: "Resume privacy setting updated successfully",
      resumePrivacy: updatedProfile.resumePrivacy, // Return the updated privacy setting
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

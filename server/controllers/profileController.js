const Profile = require("../models/profile");
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

    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
      profileExists: true,
    };

    res.json(profileWithEmail);
  } catch (err) {
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

    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
    };

    res.json(profileWithEmail);
  } catch (err) {
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

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

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

    const profilePicture =
      profile.profilePicture || "uploads/profile-pictures/default.png";

    const profileWithEmail = {
      ...profile.toObject(),
      email: user.email,
      profilePicture,
    };

    res.json(profileWithEmail);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

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
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update Resume
exports.updateResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

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

      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    profile.resume = req.file.path;
    await profile.save();

    res
      .status(200)
      .json({ message: "Resume updated successfully", resume: profile.resume });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get Resume
exports.getResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile || !profile.resume) {
      return res
        .status(200)
        .json({ resume: null, message: "No resume uploaded yet" });
    }

    const resumeFilename = profile.resume;

    if (fs.existsSync(profile.resume)) {
      return res.status(200).json({ resume: resumeFilename });
    } else {
      return res
        .status(404)
        .json({ resume: null, message: "Resume file not found" });
    }
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

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
    console.error("Error deleting Resume:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

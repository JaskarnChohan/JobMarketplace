const Profile = require("../models/profile");
const CompanyProfile = require("../models/companyProfile");
const Skill = require("../models/skill");
const Experience = require("../models/experience");
const Education = require("../models/education");
const User = require("../models/user");
const UserReview = require("../models/userReviews");
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

// Get saved jobs
exports.getSavedJobs = async (req, res) => {
  try {
    // Fetch the user's profile
    const profile = await Profile.findOne({ user: req.user.id });

    // If profile is not found, return an error
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    res.json({ savedJobs: profile.savedJobs });
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update saved jobs
exports.updateSavedJobs = async (req, res) => {
  try {
    const { savedJobs } = req.body;

    // Fetch the user's profile
    let profile = await Profile.findOne({ user: req.user.id });

    // if profile not found, return an error
    if (!profile) {
      console.log("profile not found");
      return res.status(404).json({ errors: [{ msg: "Profile not found" }] });
    }

    // Update the saved jobs using $set operator
    profile.savedJobs = savedJobs;
    await profile.save();

    res.json({ savedJobs: profile.savedJobs });
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
      posts,
    } = req.body;
    console.log("received posts: ", posts);

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
    profile.posts = posts || profile.posts;

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

exports.updateProfileById = async (req, res) => {
  const { profileId } = req.params;
  const updateData = req.body;

  try {
    const profile = await Profile.findByIdAndUpdate(profileId, updateData, {
      new: true,
    });

    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
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
    const educations = await Education.find({ profile: profile._id });
    const experiences = await Experience.find({ profile: profile._id });

    // Prepare profile details
    const profileWithDetails = {
      ...profile.toObject(),
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user.email,
      profilePicture,
      profileExists: true,
      skills,
      educations,
      experiences,
    };

    // Conditionally add posts if they exist
    if (profile.posts && profile.posts.length > 0) {
      profileWithDetails.posts = profile.posts;
    }

    // Return the profile data with related skills, education, experience, and optionally posts
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

// Create a new review for a job seeker
exports.createReview = async (req, res) => {
  // Check if the user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized. User not found." });
  }

  const { rating, content } = req.body; // Extract rating and content from the request body
  const jobSeekerID = req.params.id; // Extract the job seeker ID from the request parameters

  // Check if all required fields are provided
  if (!jobSeekerID || !rating || !content) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the user has already reviewed this job seeker
    const existingReview = await UserReview.findOne({
      user: req.user.id,
      jobSeeker: jobSeekerID,
    });

    // If a review already exists, return an error
    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this job seeker.",
      });
    }

    // Create a new review
    const review = new UserReview({
      jobSeeker: jobSeekerID,
      user: req.user.id,
      rating,
      content,
    });

    await review.save(); // Save the review to the database

    // Update the job seeker's profile with the new review
    await Profile.findByIdAndUpdate(jobSeekerID, {
      $push: { reviews: review._id },
    });

    res.status(201).json(review);
  } catch (error) {
    // Handle server error
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
};

// Fetch reviews for a job seeker
exports.getUserReviews = async (req, res) => {
  const { userId } = req.params; // Extract the job seeker ID from the request parameters

  try {
    // Fetch reviews for the job seeker
    const reviews = await UserReview.find({ jobSeeker: userId })
      .populate("user", "email") // Populate user details
      .sort({ createdAt: -1 }); // Sort by creation time

    // Check if reviews exist
    if (!reviews.length) {
      return res.status(200).json([]); // Respond with an empty array if no reviews are found
    }

    // Extract user IDs from reviews
    const userIds = reviews.map((review) => review.user._id);

    // Fetch profiles for the users who wrote the reviews
    const companyProfiles = await CompanyProfile.find({
      user: { $in: userIds },
    }).select("name user");

    // Map reviews to include company profiles
    const reviewsWithProfiles = reviews.map((review) => {
      // Find the corresponding company profile
      const companyProfile = companyProfiles.find(
        (profile) => profile.user.toString() === review.user._id.toString()
      );

      return {
        ...review.toObject(),
        companyProfile: companyProfile
          ? {
              name: companyProfile.name,
            }
          : { name: "Unknown" },
      };
    });

    // Respond with the reviews and user profiles
    res.json(reviewsWithProfiles);
  } catch (error) {
    // Handle server error
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;

  try {
    // Find the review by ID
    const review = await UserReview.findById(reviewId);

    // Check if the review exists
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the logged-in user is the author of the review
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this review" });
    }

    // Delete the review using deleteOne method
    await UserReview.deleteOne({ _id: reviewId });

    // Update the job seeker's profile to remove the review reference
    await Profile.findByIdAndUpdate(review.jobSeeker, {
      $pull: { reviews: reviewId },
    });

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    // Handle server error
    console.error("Failed to delete review:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Edit a review
exports.editReview = async (req, res) => {
  const { reviewId } = req.params; // Extract the review ID from the request parameters
  const { content, rating } = req.body; // Extract the content and rating from the request body

  try {
    // Find the review by ID
    const review = await UserReview.findById(reviewId);

    // Check if the review was not found
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Check if the logged-in user is the author of the review
    if (review.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this review." });
    }

    // Update the review
    review.content = content; // Update content
    review.rating = rating; // Update rating
    await review.save(); // Save the changes

    // Return the updated review
    res.status(200).json(review);
  } catch (error) {
    // Handle server error
    console.error("Error editing review:", error);
    res
      .status(500)
      .json({ message: "Failed to edit review.", error: error.message });
  }
};

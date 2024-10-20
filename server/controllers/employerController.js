const CompanyProfile = require("../models/companyProfile");
const CompanyReview = require("../models/companyReviews");
const Profile = require("../models/profile");
const User = require("../models/user");
const Job = require("../models/jobListing");
const fs = require("fs");
const mongoose = require("mongoose");
const companyReviews = require("../models/companyReviews");
const Notification = require("../models/notification");
const { updateProfile } = require("./profileController");

// Default logo path
const DEFAULT_LOGO = "uploads/profile-pictures/default.png";

// Fetch company profile data by user
exports.getCompanyProfile = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user.id });

    // If profile is not found, return a default profile with a flag indicating no profile exists
    if (!companyProfile) {
      return res.json({
        companyProfile: null,
        email: null,
        logo: DEFAULT_LOGO,
        profileExists: false,
      });
    }

    const user = await User.findById(req.user.id).select("email");

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    const logo = companyProfile.logo || DEFAULT_LOGO;

    const profileWithEmail = {
      ...companyProfile.toObject(),
      email: user.email,
      logo,
      profileExists: true,
    };

    res.json(profileWithEmail);
  } catch (err) {
    // Handle server error
    console.error("Error fetching company profile:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Create new company profile
exports.createCompanyProfile = async (req, res) => {
  try {
    const { name, description, industry, websiteURL, phoneNumber, location } =
      req.body;

    // Create new profile
    const companyProfile = new CompanyProfile({
      user: req.user.id,
      name,
      description,
      websiteURL,
      industry,
      phoneNumber,
      location,
    });

    await companyProfile.save();

    // Fetch user's email
    const user = await User.findById(req.user.id).select("email");

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    const profileWithEmail = {
      ...companyProfile.toObject(),
      email: user.email,
      logo: DEFAULT_LOGO,
    };

    res.status(201).json({
      message: "Company profile created successfully",
      data: profileWithEmail,
    });
  } catch (err) {
    // Handle server error
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.updateCompanyProfile = async (req, res) => {
  const { profileId } = req.params;
  const updateData = req.body;

  try {
    // Find the existing profile by ID
    const existingProfile = await CompanyProfile.findById(profileId);
    if (!existingProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Update the profile with the new data
    const updatedProfile = await CompanyProfile.findByIdAndUpdate(
      profileId,
      updateData,
      { new: true }
    );

    // If the company name has changed, update the employerName in all related jobs
    if (updateData.name && updateData.name !== existingProfile.name) {
      await Job.updateMany(
        { employer: existingProfile.user._id.toString() }, // Use the user's _id for comparison
        { $set: { company: updateData.name } } // Updating the company field
      );
    }

    // Fetch user's email
    const user = await User.findById(existingProfile.user).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    const profileWithEmail = {
      ...updatedProfile.toObject(),
      email: user.email,
    };

    res.json(profileWithEmail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

/// Update existing company profile by user ID
exports.updateCompanyProfileById = async (req, res) => {
  try {
    const { profileId } = req.params;
    const updateData = req.body;

    // Find the existing company profile by user ID
    const existingProfile = await CompanyProfile.findOne({ user: profileId });
    if (!existingProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Find and update the company profile by user ID
    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      { user: profileId },
      {
        ...updateData,
      },
      { new: true, runValidators: true }
    );

    // If profile is not found, return an error
    if (!updatedProfile) {
      console.error("Company profile not found");
      return res.status(404).json({ message: "Company profile not found" });
    }

    res.json(updatedProfile);
  } catch (err) {
    // Handle server error
    console.error("Failed to update company profile:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update company logo
exports.updateCompanyLogo = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ errors: [{ msg: "No logo uploaded" }] });
    }

    // Find the company's profile by user ID
    let companyProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Company profile not found" }] });
    }

    // Save the new company logo
    const oldLogoPath = companyProfile.logo;
    companyProfile.logo = req.file.path;
    await companyProfile.save();

    // Remove the old logo from the filesystem if it exists and is not the default logo
    if (oldLogoPath !== DEFAULT_LOGO && fs.existsSync(oldLogoPath)) {
      fs.unlinkSync(oldLogoPath);
    }

    // Respond with success
    res.json({
      msg: "Company logo updated",
      logo: companyProfile.logo,
    });
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

exports.getCompanyProfileById = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid user ID:", id);
      return res.status(400).json({ errors: [{ msg: "Invalid user ID" }] });
    }

    // Find the company profile by user ID
    const companyProfile = await CompanyProfile.findOne({ user: id }).populate(
      "user",
      "email logo"
    );

    // If profile is not found, return a default profile with a flag indicating no profile exists
    if (!companyProfile) {
      return res.json({
        companyProfile: null,
        email: null,
        logo: DEFAULT_LOGO,
        profileExists: false,
      });
    }

    // Extract user information from populated field
    const { user, logo } = companyProfile;

    const profileWithEmail = {
      ...companyProfile.toObject(),
      email: user ? user.email : null,
      logo: logo || DEFAULT_LOGO,
      profileExists: true,
    };

    res.json(profileWithEmail);
  } catch (err) {
    // Handle server error
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Fetch all employers
exports.getEmployers = async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  try {
    // Adjust the search query to match the employer's name
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    // Get total count of employers matching the query
    const totalCount = await CompanyProfile.countDocuments(query);

    // Calculate the number of employers to skip for pagination
    const skip = (page - 1) * limit;

    // Fetch employers with pagination and select relevant fields
    const employers = await CompanyProfile.find(query)
      .skip(skip)
      .limit(Number(limit));

    // Map over the employers to add job count
    const employerWithJobCounts = await Promise.all(
      employers.map(async (employer) => {
        const jobCount = await Job.countDocuments({
          employer: employer.user,
          status: "Open",
        });
        return { ...employer.toObject(), jobCount };
      })
    );

    res.status(200).json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Number(page),
      employers: employerWithJobCounts,
    });
  } catch (err) {
    // Handle server error
    res.status(500).json({ msg: "Server error" });
  }
};

// Create a new review for a company
exports.createReview = async (req, res) => {
  // Check if the user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized. User not found." });
  }

  const { rating, content } = req.body; // Extract rating and content from the request body
  const companyId = req.params.id; // Extract the company ID from the request parameters

  // Check if all required fields are provided
  if (!companyId || !rating || !content) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the user has already reviewed this company
    const existingReview = await CompanyReview.findOne({
      user: req.user.id,
      company: companyId,
    });

    // If a review already exists, return an error
    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this company.",
      });
    }

    // Create a new review
    const review = new CompanyReview({
      company: companyId,
      user: req.user.id,
      rating,
      content,
    });

    await review.save(); // Save the review to the database

    // Update the company profile with the new review
    await CompanyProfile.findByIdAndUpdate(companyId, {
      $push: { reviews: review._id },
    });

    // Create a notification for the job seeker
    const notificationMessage = `You have received a new review.`;

    const notification = new Notification({
      user: companyId, // The job seeker receives the notification
      message: notificationMessage,
      type: "REVIEW", // Type of notification
    });

    await notification.save(); // Save the notification to the database

    res.status(201).json(review);
  } catch (error) {
    // Handle server error
    console.error("Error creating review:", error);
    res
      .status(500)
      .json({ message: "Error creating review", error: error.message });
  }
};

// Fetch reviews for a company
exports.getCompanyReviews = async (req, res) => {
  const { companyId } = req.params; // Extract the company ID from the request parameters

  try {
    // Fetch reviews for the company
    const reviews = await CompanyReview.find({ company: companyId })
      .populate("user", "email") // Populate user details
      .sort({ createdAt: -1 }); // Sort by creation time

    // Check if reviews exist
    if (!reviews.length) {
      return res.status(200).json([]); // Respond with an empty array if no reviews are found
    }

    // Extract user IDs from reviews
    const userIds = reviews.map((review) => review.user._id);

    // Fetch profiles for the users who wrote the reviews
    const userProfiles = await Profile.find({
      user: { $in: userIds },
    }).select("firstName lastName user");

    // Map profiles to reviews
    const reviewsWithProfiles = reviews.map((review) => {
      const userProfile = userProfiles.find(
        (profile) => profile.user.toString() === review.user._id.toString() // Compare user IDs
      );

      return {
        ...review.toObject(),
        userProfile: userProfile
          ? { firstName: userProfile.firstName, lastName: userProfile.lastName }
          : { firstName: "Unknown", lastName: "" },
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
    const review = await CompanyReview.findById(reviewId);

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
    await CompanyReview.deleteOne({ _id: reviewId });

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
    // Find the review by ID and update it
    const updatedReview = await companyReviews.findByIdAndUpdate(
      reviewId,
      { content, rating },
      { new: true, runValidators: true } // Return the updated document
    );

    // Check if the review was not found
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Return the updated review
    res.status(200).json(updatedReview);
  } catch (error) {
    // Handle server error
    console.error("Error editing review:", error);
    res.status(500).json({ message: "Failed to edit review.", error });
  }
};

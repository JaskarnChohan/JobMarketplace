const CompanyProfile = require("../models/companyProfile");
const User = require("../models/user");
const Job = require("../models/jobListing");
const fs = require("fs");
const mongoose = require("mongoose");

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

/// Update existing company profile by user ID
exports.updateCompanyProfile = async (req, res) => {
  try {
    const {
      name,
      description,
      websiteURL,
      industry,
      phoneNumber,
      location,
      logo,
    } = req.body;

    // Find the existing company profile by user ID
    const existingProfile = await CompanyProfile.findOne({ user: req.user.id });
    if (!existingProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // Check if the company name has been changed
    const nameChanged = name && name !== existingProfile.name;

    // Find and update the company profile by user ID
    const updatedProfile = await CompanyProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        name,
        description,
        websiteURL,
        industry,
        phoneNumber,
        location,
        logo: logo !== undefined ? logo : existingProfile.logo, // Keep existing logo if none provided
      },
      { new: true, runValidators: true }
    );

    // If profile is not found, return an error
    if (!updatedProfile) {
      return res.status(404).json({ message: "Company profile not found" });
    }

    // If the company name has changed, update the employerName in all related jobs
    if (nameChanged) {
      await Job.updateMany(
        { employer: existingProfile.user._id.toString() }, // Use the user's _id for comparison
        { $set: { company: updatedProfile.name } } // Updating the company field
      );
    }

    // Fetch user's email
    const user = await User.findById(req.user.id).select("email");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }

    const profileWithEmail = {
      ...updatedProfile.toObject(),
      email: user.email,
    };

    res.status(200).json({
      message: "Company profile updated successfully",
      data: profileWithEmail,
    });
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
    if (
      oldLogoPath &&
      oldLogoPath !== DEFAULT_LOGO &&
      fs.existsSync(oldLogoPath)
    ) {
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

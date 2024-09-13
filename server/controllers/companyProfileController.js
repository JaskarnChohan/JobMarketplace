const CompanyProfile = require("../models/companyProfile");


// Create new company profile
exports.createCompanyProfile = async (req, res) => {
  try {
    const companyProfile = new CompanyProfile(req.body);
    await companyProfile.save();
    res.status(201).json(companyProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all company profiles
exports.getAllCompanyProfiles = async (req, res) => {
  try {
    const profiles = await CompanyProfile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single company profile
exports.getCompanyProfileById = async (req, res) => {
  try {
    const profile = await CompanyProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Company profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update company profile
exports.updateCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!profile) {
      return res.status(404).json({ error: "Company profile not found" });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete company profile
exports.deleteCompanyProfile = async (req, res) => {
  try {
    const profile = await CompanyProfile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: "Company profile not found" });
    }
    res.status(200).json({ message: "Company profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

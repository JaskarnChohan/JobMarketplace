const Profile = require("../models/profile");

exports.getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user');
    if (!profile) return res.status(404).send("Profile not found");
    res.json(profile);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.params.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updatedProfile) return res.status(404).send("Profile not found");
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

exports.getCompanyProfile = (req, res) => {
  res.send("Placeholder for getCompanyProfile function");
};

exports.updateCompanyProfile = (req, res) => {
  res.send("Placeholder for updateCompanyProfile function");
};
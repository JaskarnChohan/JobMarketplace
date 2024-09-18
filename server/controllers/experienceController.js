const Experience = require("../models/experience");
const mongoose = require("mongoose");

// Create Experience
exports.createExperience = async (req, res) => {
  try {
    const {
      company,
      title,
      startMonth,
      startYear,
      endMonth,
      endYear,
      current,
      description,
    } = req.body;
    const { profileId } = req.params;

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ errors: [{ msg: "Invalid Profile ID" }] });
    }

    if (current && (endMonth || endYear)) {
      return res.status(400).json({
        errors: [{ msg: "End date should be empty if currently employed" }],
      });
    }

    const experience = new Experience({
      profile: new mongoose.Types.ObjectId(profileId),
      company,
      title,
      startMonth,
      startYear,
      endMonth: current ? null : endMonth || null,
      endYear: current ? null : endYear || null,
      current,
      description,
    });

    await experience.save();
    res.json(experience);
  } catch (err) {
    console.error("Error in createExperience:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update Experience
exports.updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company,
      title,
      startMonth,
      startYear,
      endMonth,
      endYear,
      current,
      description,
    } = req.body;

    let experience = await Experience.findById(id).populate("profile");
    if (!experience) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Experience not found" }] });
    }

    if (experience.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    experience.company = company || experience.company;
    experience.title = title || experience.title;
    experience.startMonth = startMonth || experience.startMonth;
    experience.startYear = startYear || experience.startYear;

    if (current) {
      experience.endMonth = null;
      experience.endYear = null;
    } else {
      experience.endMonth = endMonth || experience.endMonth;
      experience.endYear = endYear || experience.endYear;
    }

    experience.current = current !== undefined ? current : experience.current;
    experience.description = description || experience.description;

    await experience.save();
    res.json(experience);
  } catch (err) {
    console.error("Error in updateExperience:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Delete Experience
exports.deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    let experience = await Experience.findById(id).populate("profile");
    if (!experience) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Experience not found" }] });
    }

    if (experience.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    await Experience.findByIdAndDelete(id);
    res.json({ msg: "Experience removed" });
  } catch (err) {
    console.error("Error in deleteExperience:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get Experiences
exports.getExperience = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ errors: [{ msg: "Invalid Profile ID" }] });
    }

    const experiences = await Experience.find({ profile: profileId });
    res.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

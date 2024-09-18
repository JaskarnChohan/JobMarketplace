const Skill = require("../models/skill");
const mongoose = require("mongoose");

// Create Skill
exports.createSkill = async (req, res) => {
  try {
    const { name, level, description } = req.body;
    const { profileId } = req.params;

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ errors: [{ msg: "Invalid Profile ID" }] });
    }

    // Check if required fields are provided
    if (!name || !level) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Please provide all required fields" }] });
    }

    const skill = new Skill({
      profile: new mongoose.Types.ObjectId(profileId),
      name,
      level,
      description, // Optional field
    });

    await skill.save();
    res.json(skill);
  } catch (err) {
    console.error("Error in createSkill:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};
// Update Skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, description } = req.body;

    let skill = await Skill.findById(id).populate("profile");
    if (!skill) {
      return res.status(404).json({ errors: [{ msg: "Skill not found" }] });
    }

    if (skill.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    // Update fields
    skill.name = name || skill.name;
    skill.level = level || skill.level;
    skill.description = description || skill.description;

    await skill.save();
    res.json(skill);
  } catch (err) {
    console.error("Error in updateSkill:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Delete Skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    let skill = await Skill.findById(id).populate("profile");
    if (!skill) {
      return res.status(404).json({ errors: [{ msg: "Skill not found" }] });
    }

    if (skill.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    await Skill.findByIdAndDelete(id);
    res.json({ msg: "Skill removed" });
  } catch (err) {
    console.error("Error in deleteSkill:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get Skills
exports.getSkills = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ errors: [{ msg: "Invalid Profile ID" }] });
    }

    const skillRecords = await Skill.find({ profile: profileId });
    res.json(skillRecords);
  } catch (error) {
    console.error("Error fetching skill records:", error.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

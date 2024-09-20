const Education = require("../models/education");
const mongoose = require("mongoose");

// Create Education
exports.createEducation = async (req, res) => {
  try {
    const {
      school,
      degree,
      fieldOfStudy,
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

    const education = new Education({
      profile: new mongoose.Types.ObjectId(profileId),
      school,
      degree,
      fieldOfStudy,
      startMonth,
      startYear,
      endMonth: current ? null : endMonth,
      endYear: current ? null : endYear,
      current,
      description,
    });

    await education.save();
    res.json(education);
  } catch (err) {
    console.error("Error in createEducation:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Update Education
exports.updateEducation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      school,
      degree,
      fieldOfStudy,
      startMonth,
      startYear,
      endMonth,
      endYear,
      current,
      description,
    } = req.body;

    let education = await Education.findById(id).populate("profile");
    if (!education) {
      return res.status(404).json({ errors: [{ msg: "Education not found" }] });
    }

    if (education.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    // Update fields
    education.school = school || education.school;
    education.degree = degree || education.degree;
    education.fieldOfStudy = fieldOfStudy || education.fieldOfStudy;
    education.startMonth = startMonth || education.startMonth;
    education.startYear = startYear || education.startYear;

    if (current) {
      education.endMonth = null;
      education.endYear = null;
    } else {
      education.endMonth = endMonth || education.endMonth;
      education.endYear = endYear || education.endYear;
    }

    education.current = current !== undefined ? current : education.current;
    education.description = description || education.description;

    await education.save();
    res.json(education);
  } catch (err) {
    console.error("Error in updateEducation:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Delete Education
exports.deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    let education = await Education.findById(id).populate("profile");
    if (!education) {
      return res.status(404).json({ errors: [{ msg: "Education not found" }] });
    }

    if (education.profile.user.toString() !== req.user.id) {
      return res.status(403).json({ errors: [{ msg: "Not authorized" }] });
    }

    await Education.findByIdAndDelete(id);
    res.json({ msg: "Education removed" });
  } catch (err) {
    console.error("Error in deleteEducation:", err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get Education
exports.getEducation = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!mongoose.isValidObjectId(profileId)) {
      return res.status(400).json({ errors: [{ msg: "Invalid Profile ID" }] });
    }

    const educationRecords = await Education.find({ profile: profileId });
    res.json(educationRecords);
  } catch (error) {
    console.error("Error fetching education records:", error.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

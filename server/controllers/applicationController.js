// controllers/applicationController.js

const Application = require("../models/application");

// Create a new application
exports.createApplication = async (req, res) => {
  const { userId, jobId } = req.body;

  try {
    const application = new Application({ userId, jobId });
    await application.save();
    res.status(201).json(application);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating application: " + err.message });
  }
};

// Get applications by user ID
exports.getApplicationsByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const applications = await Application.find({ userId }).populate(
      "jobId",
      "title"
    );
    res.status(200).json({ applications }); // Send an object with applications field
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error fetching applications: " + err.message });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  try {
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json(application);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating application: " + err.message });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  const { applicationId } = req.params;

  try {
    const application = await Application.findByIdAndDelete(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.status(200).json({ message: "Application deleted successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error deleting application: " + err.message });
  }
};

exports.checkApplication = async (req, res) => {
  const { jobId, userId } = req.query;

  try {
    const application = await Application.findOne({ jobId, userId });

    if (application) {
      return res.json({ hasApplied: true });
    } else {
      return res.json({ hasApplied: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getApplicationsByJobId = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await Application.find({ jobId }).populate(
      "userId",
      "name email"
    ); // Adjust fields as needed
    res.status(200).json(applications);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error fetching applications: " + err.message });
  }
};

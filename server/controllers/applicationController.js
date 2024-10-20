const Application = require("../models/application");
const { evaluateApplication } = require("./aiController");

// Create a new application
exports.createApplication = async (req, res) => {
  const { userId, jobId, questions } = req.body;

  try {
    const application = new Application({
      userId,
      jobId,
      questions,
    });
    await application.save();

    // Send the application to the AI controller for evaluation only if there are questions
    let evaluationResult = null;
    if (questions && questions.length > 0) {
      evaluationResult = await evaluateApplication(application);
      // Update the application with the overall evaluation results
      application.aiEvaluation = {
        score: evaluationResult.score,
        evaluation: evaluationResult.evaluation,
        recommendedOutcome: evaluationResult.recommendedOutcome,
      };
      await application.save(); // Save the updated application
    }

    res.status(201).json({ application, evaluationResult });
  } catch (err) {
    console.error(err);
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
    // Find the application and populate the job details
    const application = await Application.findById(applicationId).populate(
      "jobId"
    );

    // Check if the application exists
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update the status of the application
    application.status = status;
    await application.save();

    // Get the job name from the populated jobId field
    const jobName = application.jobId.title;

    // Create a notification for the user
    const notificationMessage = `Application for "${jobName}" is now "${status}".`;

    // Reuse the notification logic if you have the helper function
    const notification = new Notification({
      user: application.userId, // The user receiving the notification
      message: notificationMessage, // The notification message
      type: "APPLICATION", // Specify the type of notification
    });

    await notification.save(); // Save the notification

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
    // Check if application exists
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

// Check if user has applied to a job
exports.checkApplication = async (req, res) => {
  const { jobId, userId } = req.query;

  try {
    const application = await Application.findOne({ jobId, userId });

    // Check if application exists
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

// Get applications by job ID
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

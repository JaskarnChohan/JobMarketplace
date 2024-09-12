const express = require('express');
const Application = require('../models/savedapplication');
const router = express.Router();

router.post('/apply', async (req, res) => {
  const { userId, jobId } = req.body;

  try {
    const existingApplication = await Application.findOne({ userId, jobId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job.' });
    }

    const application = new Application({
      userId,
      jobId,
    });

    await application.save();

    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while applying to the job', error: err.message });
  }
});

router.get('/applications/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Populate jobId to get the job title from JobListing
    const applications = await Application.find({ userId }).populate({
      path: 'jobId',
      select: 'title' // Only fetch the 'title' field from JobListing
    });

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No applications found for this user.' });
    }

    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while fetching applications', error: err.message });
  }
});

module.exports = router;

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

module.exports = router;

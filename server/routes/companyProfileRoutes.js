const express = require('express');
const { protect } = require('../middleware/auth');
const CompanyProfile = require('../models/companyProfile');

const router = express.Router();



router.post('/', protect, async (req, res) => {
  try {
    const profile = new CompanyProfile({
      ...req.body,
      user: req.user.id  
    });
    await profile.save();  
    res.status(201).json(profile);  
  } catch (error) {
    console.error(error);  
    
    res.status(400).json({ error: error.message });  
    
  }
});

module.exports = router;

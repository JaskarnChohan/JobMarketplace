const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const Application = require("../models/application");

router.post("/applications", authenticate, async (req, res) => {
    const { job, user } = req.body;

    try {
        const application = new Application({
            job,
            user,
            status: "Pending"
        });

        await application.save();

        res.status(201).json({ msg: "Application submitted successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

module.exports = router;

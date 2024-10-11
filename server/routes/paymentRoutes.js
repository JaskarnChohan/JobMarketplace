// paymentRoutes.js

const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const {
  subscriptionStatus,
  createPayment,
  executePayment,
  downgradeSubscription,
  cancelSubscription,
} = require("../controllers/paymentController");

const router = express.Router();

// Route to check subscription status
router.get("/subscription-status", authenticate, subscriptionStatus);

// Create PayPal payment for monthly subscription
router.post("/create-payment", authenticate, createPayment);

// Execute payment and activate subscription
router.post("/execute-payment", authenticate, executePayment);

// Downgrade subscription
router.post("/downgrade-subscription", authenticate, downgradeSubscription);

// Cancel route for PayPal to handle subscription cancellations
router.post("/cancel", cancelSubscription);

module.exports = router;

// Import necessary modules
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");

// Notification routes
router.get("/fetch", authenticate, notificationController.getNotifications); // Fetch all notifications for the authenticated user
router.delete(
  "/:id/delete",
  authenticate,
  notificationController.deleteNotification
); // Delete a notification

// Export the router for use in other modules
module.exports = router;

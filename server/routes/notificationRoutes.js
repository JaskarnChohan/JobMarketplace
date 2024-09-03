const express = require("express");
const {
  getUserNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getUserNotifications);
router.post("/", authenticate, createNotification);
router.put("/:id/read", authenticate, markAsRead);
router.delete("/:id", authenticate, deleteNotification);

module.exports = router;

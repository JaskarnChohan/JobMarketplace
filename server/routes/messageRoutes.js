const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");

// Send a message
router.post("/send", authenticate, messageController.sendMessage);

// Get all conversations for the user
router.get(
  "/conversations/:userId",
  authenticate,
  messageController.getConversations
);

// Start a new conversation
router.post(
  "/start_conversation",
  authenticate,
  messageController.startConversation
);

// Get messages between two users
router.get(
  "/:userId/:recipientId",
  authenticate,
  messageController.getMessages
);

// Mark a message as read (Optional)
router.put("/read/:messageId", authenticate, messageController.markAsRead);

module.exports = router;

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const messageController = require("../controllers/messageController");

// Middleware to accept io instance
const initSocketRoutes = (io) => {
  // Send a message
  router.post("/send", authenticate, (req, res) => {
    messageController.sendMessage(req, res, io); // Pass io instance to controller
  });

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

  // Mark all unread messages in a conversation as read
  router.patch(
    "/read/:userId/:recipientId",
    authenticate,
    messageController.markAsRead
  );
};

module.exports = { router, initSocketRoutes };

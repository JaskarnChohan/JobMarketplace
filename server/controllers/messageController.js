const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");

// Send a message
exports.sendMessage = async (req, res, io) => {
  const { receiverId, content } = req.body;

  // Log request body for debugging
  console.log("Received request body:", req.body);

  // Check for required fields
  if (!receiverId || !content) {
    return res
      .status(400)
      .json({ message: "Receiver ID and content are required." });
  }

  // Check if user is authenticated
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  try {
    // Create the message
    const message = new Message({
      sender: req.user.id,
      recipient: receiverId,
      content,
    });

    // Save the message
    await message.save();

    // Emit the new message to all connected clients
    io.emit("receiveMessage", message); // Emit the message to all clients

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};
// Get conversations for a user
exports.getConversations = async (req, res) => {
  const userId = req.user.id; // Use req.user.id directly to avoid undefined issues

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { recipient: userObjectId }],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", userObjectId] },
              "$recipient",
              "$sender",
            ],
          },
          latestMessage: { $last: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        $lookup: {
          from: "companyprofiles", // Assuming you have a companyprofiles collection
          localField: "_id",
          foreignField: "user", // Adjust according to your schema
          as: "company",
        },
      },
      {
        $project: {
          recipientId: "$_id",
          email: { $arrayElemAt: ["$user.email", 0] },
          firstName: {
            $cond: {
              if: { $gt: [{ $size: "$profile" }, 0] },
              then: { $arrayElemAt: ["$profile.firstName", 0] },
              else: null,
            },
          },
          lastName: {
            $cond: {
              if: { $gt: [{ $size: "$profile" }, 0] },
              then: { $arrayElemAt: ["$profile.lastName", 0] },
              else: null,
            },
          },
          companyName: {
            $cond: {
              if: { $gt: [{ $size: "$company" }, 0] },
              then: { $arrayElemAt: ["$company.name", 0] },
              else: null,
            },
          },
          profilePicture: {
            $cond: [
              { $gt: [{ $size: "$profile" }, 0] }, // Check if user profile exists
              {
                $ifNull: [
                  { $arrayElemAt: ["$profile.profilePicture", 0] },
                  "uploads/profile-pictures/default.png",
                ],
              },
              {
                $ifNull: [
                  { $arrayElemAt: ["$company.logo", 0] }, // Assuming company profiles have a profilePicture field
                  "uploads/profile-pictures/default.png",
                ],
              },
            ],
          },
          latestMessage: {
            content: "$latestMessage.content",
            createdAt: "$latestMessage.createdAt", // Include the createdAt field
          },
        },
      },
    ]);

    console.log("Conversations:", conversations);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// Start a new conversation
exports.startConversation = async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id; // Use req.user.id directly to avoid undefined issues

  if (!email || !userId) {
    return res.status(400).json({ message: "Email and user ID are required." });
  }

  try {
    // Check if the user with the provided email exists
    const recipient = await User.findOne({ email });

    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found." });
    }

    // Check if a conversation already exists
    const existingConversation = await Message.findOne({
      $or: [
        { sender: userId, recipient: recipient._id },
        { sender: recipient._id, recipient: userId },
      ],
    });

    if (existingConversation) {
      return res.status(200).json({
        recipientId: recipient._id,
        email: recipient.email,
      });
    }

    // Otherwise, create a new empty conversation
    return res.status(201).json({
      recipientId: recipient._id,
      email: recipient.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting conversation" });
  }
};

// Get all messages between two users
exports.getMessages = async (req, res) => {
  const { userId, recipientId } = req.params;

  try {
    // Find all messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ createdAt: 1 }); // Sort by message creation time

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking message as read" });
  }
};

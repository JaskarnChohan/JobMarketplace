const Message = require("../models/message");
const User = require("../models/user");
const mongoose = require("mongoose");

// Send a message
exports.sendMessage = async (req, res, io) => {
  const { receiverId, content } = req.body;

  // Check for required fields in the request body
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
    let senderName = "";

    // Try to find the sender's profile in the Profile schema
    const userProfile = await Profile.findOne({ user: req.user.id });

    if (userProfile) {
      // If a user profile is found, set the senderName using firstName and lastName
      senderName = `${userProfile.firstName} ${userProfile.lastName}`;
    } else {
      // If no user profile is found, try to find the sender's company profile
      const companyProfile = await CompanyProfile.findOne({
        user: req.user.id,
      });
      if (companyProfile) {
        // If a company profile is found, set the senderName using the company name
        senderName = companyProfile.name;
      } else {
        return res.status(404).json({ message: "Sender profile not found." });
      }
    }

    // Delete old notifications for this sender-receiver pair to avoid piling up
    await Notification.deleteMany({
      user: receiverId, // The user receiving the notification
      message: { $regex: `${senderName} sent you a message.` }, // Match old message pattern
      type: "Message", // Only delete message notifications
    });

    // Create the message object with sender and recipient information
    const message = new Message({
      sender: req.user.id,
      recipient: receiverId,
      content,
    });

    // Save the message to the database
    await message.save();

    // Create a notification for the recipient
    const notificationMessage = `${senderName} sent you a message.`;
    const notification = new Notification({
      user: receiverId, // The user receiving the notification
      message: notificationMessage,
      type: "MESSAGE", // Specify the type of notification
    });

    // Save the notification to the database
    await notification.save();

    // Emit the new message to all connected clients using Socket.io
    io.emit("receiveMessage", message); // Emit the message to all clients

    // Respond with the created message
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    // Respond with an error status and message if something goes wrong
    res
      .status(500)
      .json({ message: "Error sending message", error: error.message });
  }
};

// Get conversations for a user
exports.getConversations = async (req, res) => {
  const userId = req.user.id;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    // Aggregate conversations based on sender and recipient
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
          latestMessage: { $last: "$$ROOT" }, // Get the last message in the conversation
        },
      },
      {
        // Lookup to get user details based on the conversation participant's ID
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        // Lookup to get user profile details
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "user",
          as: "profile",
        },
      },
      {
        // Lookup to get company profile details (if applicable)
        $lookup: {
          from: "companyprofiles",
          localField: "_id",
          foreignField: "user",
          as: "company",
        },
      },
      {
        // Project the necessary fields for the response
        $project: {
          recipientId: "$_id", // Assign the recipient ID
          email: { $arrayElemAt: ["$user.email", 0] }, // Get the user's email
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
                  { $arrayElemAt: ["$company.logo", 0] },
                  "uploads/profile-pictures/default.png",
                ],
              },
            ],
          },
          latestMessage: {
            sender: "$latestMessage.sender",
            content: "$latestMessage.content",
            createdAt: "$latestMessage.createdAt",
            isRead: "$latestMessage.isRead",
          },
        },
      },
    ]);
    // Respond with the aggregated conversations
    res.json(conversations);
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

// Start a new conversation
exports.startConversation = async (req, res) => {
  const { email } = req.body; // Get email from request body
  const userId = req.user.id;

  // Check if email and user ID are provided
  if (!email || !userId) {
    return res.status(400).json({ message: "Email and user ID are required." });
  }

  try {
    // Check if the user with the provided email exists
    const recipient = await User.findOne({ email });

    // If the recipient does not exist, return an error
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
      // If conversation exists, respond with recipient details
      return res.status(200).json({
        recipientId: recipient._id,
        email: recipient.email,
      });
    }

    // Otherwise, create a new empty conversation and respond with the recipient details
    return res.status(201).json({
      recipientId: recipient._id,
      email: recipient.email,
    });
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    console.error(error);
    res.status(500).json({ message: "Error starting conversation" });
  }
};

// Get all messages between two users
exports.getMessages = async (req, res) => {
  const { userId, recipientId } = req.params; // Get userId and recipientId from params

  try {
    // Mark messages as read
    await Message.updateMany(
      {
        $or: [{ sender: recipientId, recipient: userId, isRead: false }],
      },
      { $set: { isRead: true } } // Set isRead to true
    );

    // Find all messages exchanged between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: recipientId },
        { sender: recipientId, recipient: userId },
      ],
    }).sort({ createdAt: 1 }); // Sort by message creation time

    // Respond with the retrieved messages
    res.json(messages);
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    console.error(error);
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// Mark all unread messages received by the logged-in user in a conversation as read
exports.markAsRead = async (req, res) => {
  const { userId, recipientId } = req.params; // Get userId and recipientId from params

  try {
    const result = await Message.updateMany(
      {
        sender: recipientId, // Find messages sent by the recipient
        recipient: userId, // And the recipient is the logged-in user
        isRead: false, // Only mark messages that are unread
      },
      { $set: { isRead: true } }
    );

    // Respond with a success message
    res.status(200).json({ message: "Messages marked as read.", result });
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    console.error(error);
    res.status(500).json({ message: "Error marking messages as read." });
  }
};

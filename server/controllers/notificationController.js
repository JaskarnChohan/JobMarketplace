const Notification = require("../models/notification"); // Import the Notification model

// Fetch notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    // Find all notifications for the authenticated user and sort them by creation date
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications); // Respond with the retrieved notifications
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    // Find and delete the notification
    const notification = await Notification.findByIdAndDelete(req.params.id);
    // Check if the notification exists. If not then display an error message
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(204).json({ message: "Notification deleted" });
  } catch (error) {
    // Respond with an error status and message if something goes wrong
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
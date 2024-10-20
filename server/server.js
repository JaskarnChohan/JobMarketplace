// Import necessary modules
const express = require("express");
const http = require("http"); // Import http module for creating an HTTP server
const connectDatabase = require("./config/database"); // Function to connect to the database
const socketConfig = require("./config/socket"); // Function to configure the socket
// Route imports
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const employerRoutes = require("./routes/employerRoutes");
const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { createPremiumPlan } = require("./config/paypal");
const cors = require("cors"); // Middleware to enable CORS
const cookieParser = require("cookie-parser"); // Middleware to parse cookies
const localtunnel = require("localtunnel"); // Import localtunnel
require("dotenv").config(); // Load environment variables from .env file

// Initialise the Express application
const app = express();

// Connect to the Database
connectDatabase();

let planId;

createPremiumPlan()
  .then((id) => {
    planId = id; // Store the plan ID
    console.log("Created Plan ID:", planId);
  })
  .catch((error) => {
    console.error("Error creating plan:", error);
  });

// Create HTTP server with Express app
const server = http.createServer(app);

// Configure Socket.IO
const io = socketConfig(server); // Store the Socket.IO instance

// Initialise Middleware
app.use(express.json());
app.use(cookieParser());

// Configure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow credentials (cookies, etc.)
  })
);

// Define API Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);

// Middleware to initialize message routes with Socket.IO instance
const { router: messageRouter, initSocketRoutes } = messageRoutes;
initSocketRoutes(io); // Pass Socket.IO instance to message routes

app.use("/api/messages", messageRouter);
app.use("/api/notification", notificationRoutes);

// Serve static files in the uploads folder
app.use("/uploads", express.static("uploads"));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server Error" });
});

// Middleware for logging incoming requests
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for '${req.originalUrl}'`);
  next();
});

// Define PORT
const PORT = process.env.PORT || 5050; // Use the PORT from environment variables or default to 5050

// Start the Localtunnel (Used for Paypal Webhooks)
const startLocalTunnel = () => {
  const subdomain = "jobhive";
  localtunnel(PORT, { subdomain })
    .then((lt) => {
      console.log(`Localtunnel running on: ${lt.url}`);

      // Handle tunnel close event
      lt.on("close", () => {
        console.log("Localtunnel closed");
      });

      // Handle tunnel error event
      lt.on("error", (error) => {
        console.error("Localtunnel error:", error);
      });
    })
    .catch((err) => {
      console.error("Error starting Localtunnel:", err);
      setTimeout(startLocalTunnel, 10000); // Restart after 10 seconds
    });
};

// Start the local tunnel
startLocalTunnel();

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});

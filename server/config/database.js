// Import mongoose for MongoDB interactions
const mongoose = require("mongoose");

// Load environment variables from the .env file for the database connection
require("dotenv").config();

// Function to connect to the MongoDB database
const connectDatabase = async () => {
  try {
    // Connect to the database using the URI from environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!"); // Log success message
  } catch (err) {
    // Log error message and exit if the connection fails
    console.error("MongoDB connection failed!", err.message);
    process.exit(1);
  }
};

// Export the connectDatabase function for use in other modules
module.exports = connectDatabase;

const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to authenticate the user
const authenticate = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // Check if token is present
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    // Check if user exists
    if (!req.user) {
      return res.status(404).json({ msg: "User not found" });
    }

    next(); // Continue with the request
  } catch (err) {
    console.error(err);
    // Send error response if token is invalid
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Export the authenticate middleware
module.exports = authenticate;

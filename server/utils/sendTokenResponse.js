// Function to send a JSON response with a signed JWT token
const sendTokenResponse = (user, statusCode, res) => {
  // Generate a signed JWT token for the user
  const token = user.getSignedJwtToken();

  // Set cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 // Cookie expiration
    ),
    httpOnly: true, // Prevent client-side access to the cookie
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production (set to development for testing)
    sameSite: "strict", // Restrict cross-site cookie access
  };

  // Send response with token as a cookie
  res.status(statusCode).cookie("token", token, options).json({
    success: true, // Indicate success
    token, // Include the token in the response
  });
};

// Export the function for use in other modules
module.exports = sendTokenResponse;

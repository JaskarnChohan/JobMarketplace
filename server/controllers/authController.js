const User = require("../models/user");
const { validationResult, check, body } = require("express-validator");
const sendTokenResponse = require("../utils/sendTokenResponse");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { URL } = require("url");

// Validation rules
const registerValidationRules = [
  check("email", "Please provide a valid email").isEmail(),
  check("password", "Password must be at least 8 characters long").isLength({
    min: 8,
  }),
  check("role", "Role is required").notEmpty().isIn(["jobSeeker", "employer"]),
];

const loginValidationRules = [
  check("email", "Please provide a valid email").isEmail(),
  check("password", "Password is required").exists(),
];

const requestPasswordResetValidationRules = [
  body("email", "Please provide a valid email").isEmail().notEmpty(),
];

const resetPasswordValidationRules = [
  body("token", "Reset token is required").notEmpty(),
  body("newPassword", "New password is required").notEmpty(),
  body("confirmPassword", "Confirm password is required").notEmpty(),
];

// Register User
exports.register = [
  registerValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({ email, password, role });
      await user.save();

      // Send token and response
      sendTokenResponse(user, 201, res);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  },
];

// Login User
exports.login = [
  loginValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email.toLowerCase();
    const { password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // Send token and response via cookie
      sendTokenResponse(user, 200, res);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  },
];

// Logout User
exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
};

// Get User Information
exports.getUserInformation = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ errors: [{ msg: "User not found" }] });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Request Password Reset
exports.requestPasswordReset = [
  requestPasswordResetValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Email not found in the database" }] });
    }

    // Check if the last password reset request was within the last 5 minutes
    const now = Date.now();
    if (
      user.lastPasswordResetRequest &&
      now - user.lastPasswordResetRequest < 5 * 60 * 1000
    ) {
      return res.status(429).json({
        errors: [
          { msg: "Please wait before requesting another password reset." },
        ],
      });
    }

    // Update last password reset request timestamp
    user.lastPasswordResetRequest = now;

    // Generate reset token and set expiration
    user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordExpires = now + 15 * 60 * 1000; // 15 minutes

    await user.save();

    // Send email with reset link
    const resetURL = new URL(
      `/reset-password/${user.resetPasswordToken}`,
      process.env.CLIENT_URL
    ).href;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Password Reset - Job Hive",
      html: `
        <h2>Password Reset Request</h2>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your Job Hive account.</p>
        <p>Please click the following link to reset your password:</p>
        <a href="${resetURL}">Reset Password</a>
        <p>This link will expire in 15 minutes. If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Thank you,<br>The Job Hive Team</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).send("Reset link sent to email");
    } catch (error) {
      console.error("Error sending email", error);
      res.status(500).send("Error sending reset link. Please try again.");
    }
  },
];

// Reset Password
exports.resetPassword = [
  resetPasswordValidationRules,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword, confirmPassword } = req.body;

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Passwords do not match" }] });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        errors: [{ msg: "Password must be at least 8 characters long" }],
      });
    }

    // Find the user by reset token and validate expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid or expired reset token" }] });
    }

    // Update the password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).send("Password reset successful");
  },
];

// Validate Reset Token
exports.validateResetToken = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid or expired reset token" }] });
    }

    res.status(200).send("Token is valid");
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: "Server error" }] });
  }
};

// Get User ID by Email
exports.getUserIdByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Find the user by email
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user ID
    res.json({ userId: user._id });
  } catch (error) {
    console.error("Error fetching user ID by email", error);
    res.status(500).json({ message: "Server error" });
  }
};

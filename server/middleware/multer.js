const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check the file field name and set the destination folder
    if (file.fieldname === "profilePicture") {
      cb(null, "uploads/profile-pictures");
    } else if (file.fieldname === "resume") {
      cb(null, "uploads/resumes");
    } else if (file.fieldname === "logo") {
      cb(null, "uploads/logos");
    } else {
      cb(new Error("Invalid file field name"), null);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

module.exports = multer({ storage: storage });

const multer = require("multer");

// Configure multer storage (store files in memory for upload to Firebase Storage)
const storage = multer.memoryStorage();

// Middleware for uploading both video and image files
const uploade = multer({
  storage: storage,
  limits: { fileSize: 60 * 1024 * 1024 }, // Limit file size to 60MB
}).fields([
  { name: "video", maxCount: 1 }, // Field for video
  { name: "image", maxCount: 1 }, // Field for image
]);

module.exports = uploade;
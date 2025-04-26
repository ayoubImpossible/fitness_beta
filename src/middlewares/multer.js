const multer = require('multer');

// Configure multer storage (store file in memory for upload to Firebase Storage)
const storage = multer.memoryStorage();

// Middleware for uploading a single video file
const upload = multer({ storage: storage,limits: { fileSize: 60 * 1024 * 1024 } // Limit file size to 10MB
});

module.exports = upload;





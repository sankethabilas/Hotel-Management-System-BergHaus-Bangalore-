const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Destination callback - uploadsDir:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter - mimetype:', file.mimetype);
  console.log('File filter - originalname:', file.originalname);
  
  if (file.mimetype.startsWith('image/')) {
    console.log('File accepted');
    cb(null, true);
  } else {
    console.log('File rejected - not an image');
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Test endpoint
app.post('/test-upload', upload.single('profileImage'), (req, res) => {
  console.log('Upload test endpoint called');
  console.log('Request file:', req.file);
  console.log('Request body:', req.body);
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  res.json({
    success: true,
    message: 'File uploaded successfully',
    file: req.file
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error middleware:', error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.'
    });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected field name. Expected "profileImage".'
    });
  }
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  res.status(500).json({
    success: false,
    message: 'Server error: ' + error.message
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test upload server running on port ${PORT}`);
  console.log('Test with: curl -X POST -F "profileImage=@/path/to/image.jpg" http://localhost:3001/test-upload');
});

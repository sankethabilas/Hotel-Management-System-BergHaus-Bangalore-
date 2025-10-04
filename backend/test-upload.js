const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Test multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    console.log('Destination:', uploadDir);
    cb(null, uploadDir);
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

console.log('Multer configuration test:');
console.log('Storage:', storage);
console.log('File filter:', fileFilter);
console.log('Upload middleware:', upload);

// Test if uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
console.log('Uploads directory path:', uploadsDir);

module.exports = upload;

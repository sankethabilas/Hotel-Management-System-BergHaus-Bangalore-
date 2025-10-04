// Simple debug script to test multer configuration
console.log('Testing multer configuration...');

try {
  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');
  
  console.log('Multer loaded successfully');
  
  // Test uploads directory
  const uploadsDir = path.join(__dirname, 'uploads');
  console.log('Uploads directory path:', uploadsDir);
  console.log('Uploads directory exists:', fs.existsSync(uploadsDir));
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
  }
  
  // Test multer configuration
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('Destination callback called');
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      console.log('Filename callback called');
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'profile-' + uniqueSuffix + path.extname(file.originalname);
      cb(null, filename);
    }
  });
  
  console.log('Storage configured successfully');
  
  const fileFilter = (req, file, cb) => {
    console.log('File filter called');
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  };
  
  console.log('File filter configured successfully');
  
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
  });
  
  console.log('Multer configured successfully');
  console.log('Test completed successfully');
  
} catch (error) {
  console.error('Error during multer configuration test:', error);
  process.exit(1);
}

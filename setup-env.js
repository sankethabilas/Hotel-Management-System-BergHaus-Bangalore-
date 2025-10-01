const fs = require('fs');
const path = require('path');

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in backend directory');
  console.log('📝 Please update the MONGODB_URI if you\'re using a different MongoDB connection');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Please manually create a .env file in the backend directory with the following content:');
  console.log(envContent);
}


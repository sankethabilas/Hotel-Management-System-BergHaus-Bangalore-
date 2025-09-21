// Test script to check environment variables
console.log('=== Environment Variables Check ===');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

// Test if the .env.local file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
console.log('\n=== .env.local File Check ===');
console.log('File path:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('File content preview:', envContent.substring(0, 100) + '...');
} else {
  console.log('❌ .env.local file does not exist!');
  console.log('Please create frontend/.env.local with your Google credentials');
}

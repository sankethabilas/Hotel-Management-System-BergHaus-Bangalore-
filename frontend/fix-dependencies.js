const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Fixing Next.js dependencies...');

try {
  // Remove node_modules and package-lock.json
  if (fs.existsSync('node_modules')) {
    console.log('Removing node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  
  if (fs.existsSync('package-lock.json')) {
    console.log('Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
  }

  // Remove .next directory
  if (fs.existsSync('.next')) {
    console.log('Removing .next...');
    fs.rmSync('.next', { recursive: true, force: true });
  }

  console.log('Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

  console.log('Building project...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('Starting development server...');
  execSync('npm run dev', { stdio: 'inherit' });

} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

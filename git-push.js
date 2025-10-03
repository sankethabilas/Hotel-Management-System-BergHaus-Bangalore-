const { execSync } = require('child_process');

console.log('Pushing code to sanketh branch...');

try {
  // Check git status
  console.log('Checking git status...');
  execSync('git status', { stdio: 'inherit' });

  // Add all changes
  console.log('Adding all changes...');
  execSync('git add .', { stdio: 'inherit' });

  // Commit changes
  console.log('Committing changes...');
  execSync('git commit -m "Remove attendance section from frontdesk navigation and update package.json dependencies"', { stdio: 'inherit' });

  // Push to sanketh branch
  console.log('Pushing to sanketh branch...');
  execSync('git push origin sanketh', { stdio: 'inherit' });

  console.log('✅ Successfully pushed to sanketh branch!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

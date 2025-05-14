const { execSync } = require('child_process');

console.log('Installing dependencies...');

try {
  // Install each dependency individually
  execSync('npm install express', { stdio: 'inherit' });
  execSync('npm install cors', { stdio: 'inherit' });
  execSync('npm install dotenv', { stdio: 'inherit' });
  execSync('npm install google-trends-api', { stdio: 'inherit' });
  
  console.log('All dependencies installed successfully!');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}

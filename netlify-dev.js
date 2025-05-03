/**
 * Helper script for Netlify local development and testing
 * Run with: node netlify-dev.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set development environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NETLIFY_DEV = 'true';
process.env.NODE_ENV = 'development'; // Set via cross-env in the script

// Check if Netlify CLI is installed locally
try {
  require.resolve('netlify-cli');
  console.log('✅ Netlify CLI detected locally');
} catch (error) {
  console.error('❌ Netlify CLI not found locally. Installing...');
  try {
    execSync('npm install --save-dev netlify-cli', { stdio: 'inherit' });
    console.log('✅ Netlify CLI installed');
  } catch (installError) {
    console.error('❌ Failed to install Netlify CLI. Please install it manually with: npm install --save-dev netlify-cli');
    process.exit(1);
  }
}

// Check for cross-env package
try {
  require.resolve('cross-env');
  console.log('✅ cross-env package detected');
} catch (error) {
  console.error('❌ cross-env package not found. Installing...');
  try {
    execSync('npm install --save-dev cross-env', { stdio: 'inherit' });
    console.log('✅ cross-env installed');
  } catch (installError) {
    console.error('❌ Failed to install cross-env. Please install it manually with: npm install --save-dev cross-env');
    process.exit(1);
  }
}

// Create Netlify functions directory if it doesn't exist
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  console.log(`📂 Creating Netlify functions directory at: ${functionsDir}`);
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Create basic Netlify dev config if needed
const netlifyDevConfig = path.join(__dirname, 'netlify.toml');
if (!fs.existsSync(netlifyDevConfig)) {
  console.log(`📝 Creating basic netlify.toml configuration`);
  // Implementation will rely on the netlify.toml created earlier
}

console.log('🚀 Starting Netlify local development server...');
console.log('📂 Functions directory: ' + functionsDir);
console.log('🔧 Environment: development');
console.log('🌐 Auth URL: ' + process.env.NEXTAUTH_URL);
console.log('');
console.log('💡 Auth testing tips:');
console.log('   - Sign in at: http://localhost:3000/sign-in');
console.log('   - Dashboard at: http://localhost:3000/dashboard');
console.log('   - API test: http://localhost:3000/api/weather/get');
console.log('');

try {
  // Run the netlify-dev-cross script from package.json
  console.log('Running "npm run netlify-dev-cross"...');
  execSync('npm run netlify-dev-cross', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NETLIFY_DEV: 'true',
      PORT: '3000',
      TARGET_PORT: '8888' // Different from frontend port to avoid conflicts
    }
  });
} catch (error) {
  console.error('❌ Failed to start Netlify development server:', error);
} 
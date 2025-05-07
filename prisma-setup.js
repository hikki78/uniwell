/**
 * This script helps ensure Prisma can run during Netlify builds
 * It creates a dummy DATABASE_URL and DIRECT_URL if they're not set
 * This allows prisma generate to run without failing
 */

const fs = require('fs');
const path = require('path');

// Check if we're in a Netlify build environment
const isNetlify = process.env.NETLIFY === 'true' || process.env.NEXT_PUBLIC_NETLIFY_DEPLOYMENT === 'true';
console.log(`🔍 Build environment: ${isNetlify ? 'Netlify' : 'Local'}`);
console.log(`🔍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔍 NETLIFY: ${process.env.NETLIFY || 'not set'}`);
console.log(`🔍 NEXT_PUBLIC_NETLIFY_DEPLOYMENT: ${process.env.NEXT_PUBLIC_NETLIFY_DEPLOYMENT || 'not set'}`);

// Function to check if required environment variables are set
function checkEnvVars() {
  const requiredVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
    
    // For builds, create dummy values to allow prisma generate to run
    console.log('📝 Creating dummy values for Prisma to generate client');
    
    missingVars.forEach(varName => {
      process.env[varName] = 'postgresql://dummy:dummy@localhost:5432/dummydb';
      console.log(`  - Set ${varName}=postgresql://dummy:dummy@localhost:5432/dummydb`);
    });
  } else {
    console.log('✅ All required environment variables are set');
    // Log masked values to confirm they exist (without exposing credentials)
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        const maskedValue = value.replace(/[^:]+:\/\/([^:]+):[^@]+@/, '$1:****@');
        console.log(`  - ${varName} is set (masked: ${maskedValue})`);
      }
    });
  }
}

// Main function
function main() {
  console.log('🔧 Running Prisma setup script');
  
  // Check environment variables
  checkEnvVars();
  
  // Ensure the Prisma client output directory exists
  try {
    const clientOutputDir = path.join(__dirname, 'node_modules', '.prisma', 'client');
    if (!fs.existsSync(clientOutputDir)) {
      fs.mkdirSync(clientOutputDir, { recursive: true });
      console.log(`✅ Created Prisma client output directory: ${clientOutputDir}`);
    }
  } catch (error) {
    console.error(`❌ Error creating Prisma client directory: ${error.message}`);
  }
  
  console.log('✅ Prisma setup complete');
}

// Run the script
try {
  main();
} catch (error) {
  console.error(`❌ Error in prisma-setup.js: ${error.message}`);
  process.exit(1);
} 
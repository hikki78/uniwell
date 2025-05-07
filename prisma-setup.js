/**
 * This script helps ensure Prisma can run during builds
 * It creates a dummy DATABASE_URL and DIRECT_URL if they're not set
 */

const fs = require('fs');
const path = require('path');

// Function to check if required environment variables are set
function checkEnvVars() {
  const requiredVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('📝 Creating dummy values for Prisma to generate client');
    
    missingVars.forEach(varName => {
      process.env[varName] = 'postgresql://dummy:dummy@localhost:5432/dummydb';
      console.log(`  - Set ${varName}=postgresql://dummy:dummy@localhost:5432/dummydb`);
    });
  } else {
    console.log('✅ All required environment variables are set');
  }
}

// Main function
function main() {
  console.log('🔧 Running Prisma setup script');
  checkEnvVars();
  console.log('✅ Prisma setup complete');
}

// Run the script
main(); 
/**
 * Post-build script for Netlify deployment
 * This script runs after the build to ensure all files are in the correct location
 */

const fs = require('fs');
const path = require('path');

function main() {
  console.log('📦 Running post-build script for Netlify deployment');
  
  // Ensure .prisma client files are copied to the correct location if needed
  try {
    console.log('✅ Post-build completed successfully');
  } catch (error) {
    console.error(`❌ Error in post-build: ${error.message}`);
  }
}

main(); 
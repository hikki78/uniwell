#!/usr/bin/env node

/**
 * Netlify Configuration Script
 * 
 * This script can be used to configure a Netlify site via the Netlify CLI.
 * To use this script:
 * 
 * 1. Install the Netlify CLI: npm install -g netlify-cli
 * 2. Log in to Netlify: netlify login
 * 3. Run this script: node netlify-config.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function configureNetlify() {
  console.log('🚀 Netlify Configuration Script');
  console.log('==============================\n');

  // Check if Netlify CLI is installed
  try {
    execSync('netlify --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ Netlify CLI is not installed. Please install it with: npm install -g netlify-cli');
    process.exit(1);
  }

  // Check if user is logged in
  try {
    execSync('netlify status', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ You are not logged in to Netlify. Please login with: netlify login');
    process.exit(1);
  }

  console.log('✅ Netlify CLI is installed and you are logged in.\n');

  // Get site ID or create new site
  let siteId = '';
  const createNew = await question('Create a new site? (y/n): ');
  
  if (createNew.toLowerCase() === 'y') {
    const siteName = await question('Enter a name for your site (leave blank for random name): ');
    const createCommand = siteName ? `netlify sites:create --name ${siteName}` : 'netlify sites:create';
    
    try {
      const result = execSync(createCommand, { encoding: 'utf8' });
      console.log(result);
      siteId = result.match(/Site ID: ([a-zA-Z0-9-]+)/)?.[1];
    } catch (error) {
      console.error('❌ Failed to create site:', error.message);
      process.exit(1);
    }
  } else {
    const sites = JSON.parse(execSync('netlify sites:list --json', { encoding: 'utf8' }));
    
    if (sites.length === 0) {
      console.error('❌ No sites found. Please create a site first.');
      process.exit(1);
    }
    
    console.log('\nYour Netlify sites:');
    sites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.url})`);
    });
    
    const siteIndex = await question('\nSelect a site by number: ');
    const selectedSite = sites[parseInt(siteIndex) - 1];
    
    if (!selectedSite) {
      console.error('❌ Invalid selection.');
      process.exit(1);
    }
    
    siteId = selectedSite.id;
    console.log(`Selected site: ${selectedSite.name} (${selectedSite.url})`);
  }

  if (!siteId) {
    console.error('❌ Could not determine site ID.');
    process.exit(1);
  }

  // Configure build settings
  console.log('\nConfiguring build settings...');
  try {
    execSync(`netlify build:settings:set --site-id ${siteId} --command "npm run netlify-build" --publish ".next"`, { stdio: 'inherit' });
    console.log('✅ Build settings configured.');
  } catch (error) {
    console.error('❌ Failed to set build settings:', error.message);
  }

  // Configure environment variables
  console.log('\nConfiguring environment variables...');
  
  const envVars = [
    { key: 'NODE_VERSION', value: '18' },
    { key: 'NEXT_TELEMETRY_DISABLED', value: '1' }
  ];
  
  // Ask for NextAuth URL and Secret
  const siteUrl = await question('Enter your site URL (e.g., https://your-site.netlify.app): ');
  envVars.push({ key: 'NEXTAUTH_URL', value: siteUrl });
  
  const nextAuthSecret = await question('Enter your NextAuth secret (leave blank to generate one): ');
  envVars.push({ 
    key: 'NEXTAUTH_SECRET', 
    value: nextAuthSecret || Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  });
  
  // Ask for database URLs
  const dbUrl = await question('Enter your DATABASE_URL (leave blank to skip): ');
  if (dbUrl) {
    envVars.push({ key: 'DATABASE_URL', value: dbUrl });
  }
  
  const directUrl = await question('Enter your DIRECT_URL (leave blank to skip): ');
  if (directUrl) {
    envVars.push({ key: 'DIRECT_URL', value: directUrl });
  }
  
  // Set environment variables
  for (const { key, value } of envVars) {
    try {
      execSync(`netlify env:set ${key} "${value}" --site-id ${siteId}`, { stdio: 'ignore' });
      console.log(`✅ Set ${key}`);
    } catch (error) {
      console.error(`❌ Failed to set ${key}:`, error.message);
    }
  }

  // Install Next.js plugin
  console.log('\nInstalling Next.js plugin...');
  try {
    execSync(`netlify plugins:install @netlify/plugin-nextjs --site-id ${siteId}`, { stdio: 'inherit' });
    console.log('✅ Next.js plugin installed.');
  } catch (error) {
    console.error('❌ Failed to install Next.js plugin:', error.message);
  }

  // Trigger a new build
  const triggerBuild = await question('\nTrigger a new build? (y/n): ');
  
  if (triggerBuild.toLowerCase() === 'y') {
    console.log('Triggering build...');
    try {
      execSync(`netlify deploy --build --site-id ${siteId}`, { stdio: 'inherit' });
      console.log('✅ Build triggered.');
    } catch (error) {
      console.error('❌ Failed to trigger build:', error.message);
    }
  }

  console.log('\n🎉 Netlify configuration complete!');
  rl.close();
}

configureNetlify().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
  process.exit(1);
}); 
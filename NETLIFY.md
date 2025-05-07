# Netlify Deployment Instructions

This document provides instructions for deploying this Next.js application to Netlify without using a `netlify.toml` file.

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider and select this repository

### 2. Configure Build Settings

In the Netlify site settings, set the following:

- **Build command**: `npm run netlify-build`
- **Publish directory**: `.next`

### 3. Environment Variables

Add the following environment variables in the Netlify dashboard (Site settings > Environment variables):

- `NODE_VERSION`: `18`
- `NEXT_TELEMETRY_DISABLED`: `1`
- `NEXTAUTH_URL`: Your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
- `NEXTAUTH_SECRET`: Your secret key for NextAuth
- `DATABASE_URL`: Your database connection string
- `DIRECT_URL`: Your direct database connection string (if applicable)

### 4. Install Netlify Next.js Plugin

1. Go to Site settings > Plugins
2. Search for "Next.js" in the plugins directory
3. Install the "@netlify/plugin-nextjs" plugin

### 5. Deploy

1. Trigger a new deployment from the Netlify dashboard
2. Wait for the build to complete
3. Your site should now be live with the "Work In Progress" page showing for the dashboard route

## How It Works

This deployment uses the following files:

- `public/_redirects`: Handles routing for client-side navigation
- `public/dashboard/index.html`: Static fallback for the dashboard route
- `public/dashboard/work-in-progress/index.html`: Static fallback for the work-in-progress page
- `public/404.html`: Custom 404 page that shows the "Work In Progress" design

The Next.js configuration in `next.config.js` is set up to work with Netlify, with images set to `unoptimized: true` in production.

## Troubleshooting

If you encounter build errors:

1. Check that all environment variables are correctly set
2. Ensure the Next.js plugin is installed
3. Verify that the Prisma schema is valid and can be generated during build
4. Check the build logs for specific error messages

If the "Work In Progress" page isn't showing:

1. Verify that the `_redirects` file is properly deployed to the publish directory
2. Check that the static HTML fallback files are in the correct locations
3. Ensure the image paths in the HTML files are correct 
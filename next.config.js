/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    // Only unoptimized in production for Netlify
    unoptimized: process.env.NODE_ENV === 'production', 
  },
  webpack: (config, { isServer }) => {
    // Handle Node.js specific modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Provide empty modules for Node.js specific features
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'aws-sdk': false,
        'mock-aws-s3': false,
      };
    }
    return config;
  },
  // Add output settings only for production
  ...(process.env.NODE_ENV === 'production' ? {
    output: 'standalone',
  } : {}),
  // Environment variables for the client
  env: {
    // Production vs development settings
    NEXTAUTH_URL: process.env.NODE_ENV === 'production' 
      ? (process.env.URL || 'https://uniwell.netlify.app')
      : 'http://localhost:3000',
    NETLIFY_URL: process.env.NODE_ENV === 'production'
      ? (process.env.URL || 'https://uniwell.netlify.app')
      : 'http://localhost:3000',
    // Shared variables for all environments
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-do-not-use-in-production'
  },
};

const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withNextIntl(nextConfig);

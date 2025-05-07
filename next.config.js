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
    unoptimized: process.env.NODE_ENV === 'production', // Required for Netlify
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
      ? process.env.NEXTAUTH_URL || 'http://localhost:3000'
      : 'http://localhost:3000',
    // Shared variables for all environments
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'development-secret-do-not-use-in-production'
  },
  // Special handling for dynamic routes in static export
  experimental: {
    // For Netlify deployment
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
    ]
  },
  // Disable using server components for API routes in static exports
  serverComponentsExternalPackages: [],
};

const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withNextIntl(nextConfig);

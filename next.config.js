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
};

const withNextIntl = require("next-intl/plugin")("./i18n.ts");

module.exports = withNextIntl(nextConfig);

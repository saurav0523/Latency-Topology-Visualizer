import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@react-three/fiber', '@react-three/drei', 'three', 'framer-motion', 'recharts'],
  },

  // Configure webpack for better performance
  webpack: (config, { dev, isServer }) => {
    // Optimize for development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }

    return config;
  },

  // Optimize images and static assets
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable compression
  compress: true,

  // Enable source maps only in development
  productionBrowserSourceMaps: false,
};

export default nextConfig;

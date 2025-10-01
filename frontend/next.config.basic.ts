import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: [],
    unoptimized: true, // Disable image optimization to reduce memory usage
  },
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
};

export default nextConfig;

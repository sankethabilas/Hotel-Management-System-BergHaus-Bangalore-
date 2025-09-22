import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speed up development
  typescript: {
    // Speed up build by skipping type checking during dev
    // (you can still run `npm run build` for full type checking)
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Skip ESLint during builds to speed up
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Optimize bundle size
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Speed up development builds
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second instead of file watching
        aggregateTimeout: 300,
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
  
  // Speed up hot reloading
  experimental: {
    optimizeCss: false, // Disable CSS optimization in dev
  },
  
  // Reduce memory usage during development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Speed up development
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // Optimize bundle size and performance
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
        poll: 1000,
        aggregateTimeout: 300,
      };
      
      // Optimize for faster rebuilds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: [],
    unoptimized: true,
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Enable optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/services', '@/types'],
  },
};

export default nextConfig;
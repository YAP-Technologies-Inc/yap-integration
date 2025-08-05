import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⛔ Ignores TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // ⛔ Ignores ESLint errors during build
  },
  webpack: (config) => {
    // You can add custom tweaks here if needed
    return config;
  },
};

export default withAnalyzer(nextConfig);

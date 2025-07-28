import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 👇 explicitly allow your custom dev domains
    allowedDevOrigins: ['https://dev-frontend-yap.ngrok.app'],
  },
};


export default withAnalyzer(nextConfig);

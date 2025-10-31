/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatibility
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Image optimization is not supported on Cloudflare Pages
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.be2nd.com',
      },
    ],
  },
  // Enable React strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;


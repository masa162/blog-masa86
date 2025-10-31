/** @type {import('next').NextConfig} */
const nextConfig = {
  // Node.js runtime優先（Cloudflare Pagesでのリンク安定性）
  experimental: {
    // 必要に応じて設定を追加
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.be2nd.com',
      },
    ],
  },
};

module.exports = nextConfig;


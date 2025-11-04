/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Backend API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/:path*', // Remove /api prefix
      },
    ];
  },
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;

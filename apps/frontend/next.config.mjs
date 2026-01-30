/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Backend API proxy
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/:path*`, // Proxy to Backend
      },
    ];
  },
  // Empty turbopack config to silence warning
  turbopack: {},
};

export default nextConfig;

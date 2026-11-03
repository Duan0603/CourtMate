/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optional isolated output for production verification alongside next dev.
  distDir: process.env.COURTMATE_BUILD_DIR || '.next',
  transpilePackages: ['@courtmate/shared'],
  swcMinify: true,
  reactStrictMode: false,
  onDemandEntries: {
    // Keep compiled pages in memory for 1 hour so switching tabs is instant without recompiling
    maxInactiveAge: 60 * 60 * 1000,
    // Keep up to 25 pages simultaneously in buffer
    pagesBufferLength: 25,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'antd',
      '@ant-design/icons',
      '@ant-design/nextjs-registry',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;

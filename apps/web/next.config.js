/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@courtmate/shared'],
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

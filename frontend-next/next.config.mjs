import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/xr'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three': path.resolve('./node_modules/three'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'three': './node_modules/three',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

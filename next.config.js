/** @type {import('next').NextConfig} */
// const withImages = require('next-images');

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/welcome' },
    };
  },
};

module.exports = nextConfig;

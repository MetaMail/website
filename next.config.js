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
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;

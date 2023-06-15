/** @type {import('next').NextConfig} */
// const withImages = require('next-images');

const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    exportTrailingSlash: true,
    exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
        return {
            '/': { page: '/welcome' },
            '/mailbox': { page: '/mailbox' },
        };
    },
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;

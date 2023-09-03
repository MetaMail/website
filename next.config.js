/** @type {import('next').NextConfig} */
// const withImages = require('next-images');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    trailingSlash: true,
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
    sassOptions: {
        includePaths: ['**/*.scss'],
    },
};

module.exports = withBundleAnalyzer(nextConfig);

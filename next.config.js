/** @type {import('next').NextConfig} */
// const withImages = require('next-images');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const withTM = require('next-transpile-modules')(['openaccount-connect']);

const nextConfig = {
    reactStrictMode: false,
    swcMinify: true,
    trailingSlash: true,
    exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
        return {
            '/': { page: '/welcome' },
            '/FAQs': { page: '/FAQs' },
            '/privacy-policy': { page: '/privacy-policy' },
            '/terms-of-service': { page: '/terms-of-service' },
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
    // 配置页面缓存
    // 这里使用了缓存策略，可以根据需要进行调整
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=3600, must-revalidate',
                    },
                ],
            },
        ];
    },
    experimental: {
        esmExternals: 'loose',
    },  
};

module.exports = withTM(withBundleAnalyzer(nextConfig));

/** @type {import('next').NextConfig} */
// const withImages = require('next-images');

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
};

// module.exports = withImages({
//   webpack(nextConfig) {
//     return nextConfig;
//   },
// });

module.exports = nextConfig;
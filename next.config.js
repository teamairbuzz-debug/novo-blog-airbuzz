/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        stackbitPreview: process.env.STACKBIT_PREVIEW
    },
    trailingSlash: true,
    reactStrictMode: true,
    images: {
        unoptimized: true
    },
    typescript: {
        ignoreBuildErrors: true
    }
};

module.exports = nextConfig;

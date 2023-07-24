/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    staticPageGenerationTimeout: 60 * 10, // 10 minutes
    webpack: (config) => {
        config.resolve.fallback = { fs: false, path: false, crypto: false }
        // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
        // config.experiments = {
        //     ...config.experiments,
        //     asyncWebAssembly: true,
        // }

        return config
    },
    experimental: {
        serverActions: true,
    },
}

module.exports = nextConfig

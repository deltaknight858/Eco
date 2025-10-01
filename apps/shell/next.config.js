/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@eco/core-tokens', '@eco/halo-components'],
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
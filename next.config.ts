import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.shngm.id' },
      { protocol: 'https', hostname: 'storage.shngm.id' },
      { protocol: 'https', hostname: 'delivery.shngm.id' },
      { protocol: 'https', hostname: 'cdn.shngm.id' },
    ],
  },
}

export default nextConfig

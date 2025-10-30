import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache in dev to avoid PackFileCacheStrategy big string serialization
      // @ts-ignore
      config.cache = { type: 'memory' };
      // Suppress the specific PackFileCacheStrategy warning line
      // @ts-ignore
      config.ignoreWarnings = [
        /webpack\.cache\.PackFileCacheStrategy.*Serializing big strings/,
      ];
      // Also reduce general warnings noise
      // @ts-ignore
      config.stats = { warnings: false };
    }
    // Reduce infrastructure logging noise
    // @ts-ignore
    config.infrastructureLogging = { level: 'error' };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

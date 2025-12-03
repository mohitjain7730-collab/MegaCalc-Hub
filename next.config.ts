import type {NextConfig} from 'next';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // swcMinify is default in Next.js 15, removed deprecated option
  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts',
      'date-fns',
    ],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { dev, isServer }) => {
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
    
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        // usedExports is enabled by default in Next.js production builds
        // Explicitly setting it conflicts with cacheUnaffected in Next.js 15
        sideEffects: false, // Assume no side effects for better tree shaking
        moduleIds: 'deterministic', // Better caching
        chunkIds: 'deterministic', // Better caching
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 150000, // Further reduced for better parallel loading and TBT
          maxAsyncRequests: 30, // Limit concurrent async chunks
          maxInitialRequests: 25, // Limit initial chunks
          cacheGroups: {
            default: false,
            vendors: false,
            // Firebase chunk (large library)
            firebase: {
              name: 'firebase',
              test: /[\\/]node_modules[\\/]firebase[\\/]/,
              chunks: 'all',
              priority: 40,
              enforce: true,
            },
            // Recharts chunk (large charting library)
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              chunks: 'all',
              priority: 35,
              enforce: true,
            },
            // Separate chunk for lucide-react
            lucide: {
              name: 'lucide',
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Separate chunk for radix-ui
            radix: {
              name: 'radix',
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Vendor chunk for other large libraries
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              minChunks: 2,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
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
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
  },
  // Add cache headers and compression for static assets
  async headers() {
    return [
      {
        // Static assets (JS, CSS)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Fonts
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Images
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Output optimization
  output: 'standalone',
  // Production source maps disabled for smaller bundle
  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);

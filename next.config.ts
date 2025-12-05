import type { NextConfig } from 'next';
import { calculators } from './src/lib/calculators';

// @next/bundle-analyzer uses CommonJS exports, so we use require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Allow TypeScript build errors only during development
    ignoreBuildErrors: isDev,
  },
  eslint: {
    // Skip ESLint during builds only in development
    ignoreDuringBuilds: isDev,
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
    // Ensure resolve and fallback objects exist to keep dynamic imports robust
    // This is a safe no-op in most cases but helps avoid undefined fallback errors
    // when webpack processes dynamic import paths.
    // eslint-disable-next-line no-param-reassign
    config.resolve = config.resolve || {};
    // eslint-disable-next-line no-param-reassign
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
    };

    // Exclude Node.js built-in modules from client bundle
    // This prevents webpack from trying to bundle fs, path, etc. in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        net: false,
        tls: false,
        child_process: false,
        'fs/promises': false,
      };
    }

    // Improve chunk loading reliability
    if (!isServer) {
      // @ts-ignore
      config.output = config.output || {};
      
      // Better chunk filename for cache busting and reliability
      // @ts-ignore
      if (!config.output.chunkFilename) {
        // @ts-ignore
        config.output.chunkFilename = dev 
          ? 'static/chunks/[name].js' 
          : 'static/chunks/[name].[contenthash:8].js';
      }
      
      // Improve chunk loading with better error handling
      // @ts-ignore
      if (config.optimization && config.optimization.splitChunks) {
        // @ts-ignore
        config.optimization.splitChunks.automaticNameDelimiter = '~';
      }
    }

    // Note: Chunk error handling is done via ChunkErrorHandler component in layout.tsx
    // and safe-dynamic-import wrapper for all dynamic imports

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
        // Global security headers for all routes
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            // Allow required Firebase, Google Ads/tag, and image/font domains while keeping a reasonably strict baseline
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://securepubads.g.doubleclick.net https://www.gstatic.com https://firebase.googleapis.com https://www.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*",
              "connect-src 'self' https://firebase.googleapis.com https://firebaseinstallations.googleapis.com https://firestore.googleapis.com https://www.google-analytics.com https://stats.g.doubleclick.net",
              "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
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
  // Redirects: Redirect old /calculator/{slug} routes to canonical /category/{category}/{slug} routes
  async redirects() {
    // Create redirects for all calculators from /calculator/{slug} to /category/{category}/{slug}
    const calculatorRedirects = calculators.map((calc) => ({
      source: `/calculator/${calc.slug}`,
      destination: `/category/${calc.category}/${calc.slug}`,
      permanent: true, // 308 permanent redirect for SEO
    }));

    return calculatorRedirects;
  },
};

export default withBundleAnalyzer(nextConfig);

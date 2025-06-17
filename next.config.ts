import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Server external packages (moved from experimental in Next.js 15+)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],

  // Enhanced security headers for DAL-based authentication
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            // Mitigate CVE-2025-29927 by blocking middleware subrequest header
            key: 'x-middleware-subrequest',
            value: '',
          },
        ],
      },
      // Additional security for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value:
              process.env.NODE_ENV === 'production'
                ? 'https://yourdomain.com' // Replace with your domain
                : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
        ],
      },
    ];
  },

  // TypeScript configuration
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Don't ignore ESLint errors during build
    ignoreDuringBuilds: false,
  },

  // Output configuration for self-hosting
  // Comment out if deploying to Vercel/Netlify
  // output: 'standalone',

  // Enable gzip compression
  compress: true,

  // Power optimization for development
  poweredByHeader: false,

  // Experimental features for better security
  experimental: {
    // Optimize for DAL pattern
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for better UX
  async redirects() {
    return [
      // Redirect old auth routes
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/register',
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxy if needed
  async rewrites() {
    return [
      // Proxy API calls in development
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              source: '/api/proxy/:path*',
              destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;

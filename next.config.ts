import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide X-Powered-By header
  poweredByHeader: false,
  reactStrictMode: true,
  // Increase body size limit for admin posts with embedded images
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    middlewareClientMaxBodySize: "50mb",
    optimizePackageImports: ["lucide-react", "react-hot-toast"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // Cache optimized images for 1 year
  },
  // Security + Performance headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent XSS
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      // Cache static assets aggressively (1 year)
      {
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache Next.js static assets forever (hashed filenames)
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache fonts
      {
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Cache API responses with stale-while-revalidate for fast loads
      {
        source: "/api/categories",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/api/products",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=300" },
        ],
      },
      // Cache favicon API  
      {
        source: "/api/favicon",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
  // Compress output
  compress: true,
  // Fix dynamic uploads not showing in production
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;

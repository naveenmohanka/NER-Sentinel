import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "cumulative-visibility-sunset-bryant.trycloudflare.com",
    "leadership-mortgage-packets-supports.trycloudflare.com",
  ],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      {
        source: "/api/chat",
        destination: `${BACKEND_URL}/api/chat`,
      },
      {
        source: "/predict",
        destination: `${BACKEND_URL}/predict`,
      },
      {
        source: "/explain-risk",
        destination: `${BACKEND_URL}/explain-risk`,
      },
      {
        source: "/nasa-3d-map",
        destination: "/nasa-3d-map/index.html",
      },
      {
        source: "/nasa-3d-map/",
        destination: "/nasa-3d-map/index.html",
      },
    ];
  },
};

export default nextConfig;

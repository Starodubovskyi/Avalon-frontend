/** Backend origin for the /api/v1 proxy when NEXT_PUBLIC_API_URL is relative (local dev) */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET || "http://localhost:3020").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

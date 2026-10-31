/** Backend origin for the /api/v1 proxy when NEXT_PUBLIC_API_URL is relative (local dev) */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET || "http://localhost:3020").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy profile hub pages backed by endpoints that never existed — send them to the real screens
      { source: "/profile", destination: "/account", permanent: false },
      { source: "/companyprofile", destination: "/companies", permanent: false },
      { source: "/mypoints", destination: "/companies", permanent: false },
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

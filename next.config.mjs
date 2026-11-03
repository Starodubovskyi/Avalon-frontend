import createNextIntlPlugin from "next-intl/plugin";

/** Interface language comes from a cookie (see i18n/request.ts), not from the URL */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** Backend origin for the /api/v1 proxy when NEXT_PUBLIC_API_URL is relative (local dev) */
const API_PROXY_TARGET = (process.env.API_PROXY_TARGET || "http://localhost:3020").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Legacy profile hub pages backed by endpoints that never existed — send them to the real screens
      { source: "/profile", destination: "/account", permanent: false },
      { source: "/companyprofile", destination: "/companies", permanent: false },
      { source: "/mypoints", destination: "/companies?tab=mine", permanent: false },
      // Stage 2: the old mock billing / subscription screens became the credits balance
      { source: "/billing", destination: "/balance", permanent: false },
      { source: "/paynow", destination: "/balance", permanent: false },
      { source: "/paynow/success", destination: "/balance", permanent: false },
      { source: "/subscriptions", destination: "/balance", permanent: false },
      // Mock public profiles of the previous developer → the real people directory (/people/[id])
      { source: "/u/:username", destination: "/people", permanent: false },
      // English-only legacy screens still reachable by URL → their translated successors (files kept)
      { source: "/faq", destination: "/support", permanent: false },
      { source: "/guide", destination: "/port-guide", permanent: false },
      { source: "/services", destination: "/dashboard", permanent: false },
      { source: "/admincompanies", destination: "/companies", permanent: false },
      { source: "/lineup/ports", destination: "/lineup", permanent: false },
      { source: "/lineup/ports/:id", destination: "/lineup", permanent: false },
      { source: "/lineup/products", destination: "/lineup", permanent: false },
      { source: "/lineup/product/:slug", destination: "/lineup", permanent: false },
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

export default withNextIntl(nextConfig);

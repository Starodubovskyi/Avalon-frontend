/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/maps",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

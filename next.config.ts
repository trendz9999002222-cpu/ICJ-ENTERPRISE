import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    qualities: [75, 90, 95],
  },
  async redirects() {
    return [
      {
        source: "/advocates",
        destination: "/professionals",
        permanent: true,
      },
      {
        source: "/admin/advocates",
        destination: "/admin/professionals",
        permanent: true,
      },
      {
        source: "/admin/advocates/:id",
        destination: "/admin/professionals/:id",
        permanent: true,
      },
      {
        source: "/admin/practice-areas/registrations",
        destination: "/admin/professionals",
        permanent: true,
      },
      {
        source: "/admin/practice-areas/registrations/:id",
        destination: "/admin/professionals/:id",
        permanent: true,
      },
      {
        source: "/dashboard/advocate",
        destination: "/dashboard/professional",
        permanent: true,
      },
      {
        source: "/dashboard/advocate/:path*",
        destination: "/dashboard/professional/:path*",
        permanent: true,
      },
      {
        source: "/admin/dashboard",
        destination: "/dashboard/admin",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.munjiz.store" }],
        destination: "https://munjiz.store/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "almunjiz-two.vercel.app" }],
        destination: "https://munjiz.store/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

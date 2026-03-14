import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["next-editor"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'github.com',
      'avatars.githubusercontent.com',
      'raw.githubusercontent.com',
    ],
  },
  /* config options here */
};

export default nextConfig;
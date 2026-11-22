import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remote hosts used by uploaded service photos, vendor avatars and seeded
  // placeholder imagery. Required by next/image's optimizer.
  images: {
    // next/image only allows qualities listed here; custom values used by
    // SafeImage (cards, thumbnails, gallery) must be included.
    qualities: [55, 60, 72, 75, 78],
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Photography sources.
     *
     * Seeded Picsum gives every slot a stable, real photograph while the club
     * and tournament assets are still being shot. Unsplash is allowed so real
     * URLs can be dropped into the manifest without touching config. Files
     * placed under /public/img win over both: the manifest checks there first.
     */
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;

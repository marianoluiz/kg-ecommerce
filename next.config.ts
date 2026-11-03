import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Product images uploaded from the admin panel live in Supabase Storage.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  // Admin product image uploads (5 MB max, checked in the action).
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;

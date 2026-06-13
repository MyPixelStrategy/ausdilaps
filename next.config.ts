import type { NextConfig } from "next";
import { REDIRECTS } from "./data/redirects";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (public assets) and Cloudflare R2 public hostnames.
      // Fill in once the Supabase project + R2 bucket are provisioned, e.g.:
      // { protocol: "https", hostname: "<project>.supabase.co", pathname: "/storage/v1/object/public/**" },
      // { protocol: "https", hostname: "<account>.r2.cloudflarestorage.com" },
    ],
  },
  async redirects() {
    return REDIRECTS;
  },
};

export default nextConfig;

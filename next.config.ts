import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // ยอมรับทุก sub-domain ของ supabase
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com', // (Optional) ใส่เพื่อรองรับรูปจากเว็บอื่นภายนอกด้วย
      }
    ],
  },
};

export default nextConfig;
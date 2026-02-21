import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 👇 나영님의 모든 IP 접속을 허용합니다.
      allowedOrigins: ["*"], 
    },
  },
  images: { unoptimized: true },
};

export default nextConfig;
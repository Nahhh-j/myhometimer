import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 🚨 이 한 줄이 핵심입니다! (결과물을 out 폴더에 생성)
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      // 👇 나영님의 모든 IP 접속을 허용합니다.
      allowedOrigins: ["*"], 
    },
  },
  images: { unoptimized: true },
};

export default nextConfig;
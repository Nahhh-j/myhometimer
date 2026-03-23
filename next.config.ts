import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚨 [매우 중요] Vercel 배포할 때는 이 줄을 반드시 '주석 처리' 하세요!
  // output: 'export', 
  
  typescript: { ignoreBuildErrors: true },
  
  // 🌟 빨간 줄 해결! experimental 밖으로 당당하게 꺼냈습니다.
  outputFileTracingIncludes: {
    '/api/**/*': ['./certs/**/*'],
  },

  // CORS 보안 게이트 열기 (토스 앱 통신용)
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" }, 
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["*"], 
    },
  },
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
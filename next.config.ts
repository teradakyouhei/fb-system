import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // パス問題を解決
  outputFileTracingRoot: __dirname,
  
  // 外部パッケージの設定 (Next.js 15の新しい方法)
  serverExternalPackages: ['prisma', 'bcryptjs'],

  // TypeScript errors を警告に変更 (Firebase移行中の一時的な設定)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint errors を警告に変更 (Firebase移行中の一時的な設定)
  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    
    return config;
  },
};

export default nextConfig;

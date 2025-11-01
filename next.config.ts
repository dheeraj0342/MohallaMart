import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ioredis", "typesense"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        dns: false,
        async_hooks: false,
        "node:async_hooks": false,
        "node:fs": false,
        "node:net": false,
        "node:tls": false,
        "node:crypto": false,
        "node:dns": false,
      };
    }
    return config;
  },
};

export default nextConfig;

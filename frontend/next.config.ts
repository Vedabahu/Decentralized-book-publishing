import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@rainbow-me/rainbowkit", "wagmi", "viem", "@tanstack/react-query"],
};

export default nextConfig;

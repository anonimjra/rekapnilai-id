import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/rekapnilai-id",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

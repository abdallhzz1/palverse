import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

const appRoot = path.join(__dirname);
const repoRoot = path.join(__dirname, "..");
// Full monorepo clone (typical on Vercel with Root Directory = this app).
const isMonorepoCheckout =
  fs.existsSync(path.join(repoRoot, "palverse-web")) &&
  fs.existsSync(path.join(repoRoot, "palverse-admin"));

/**
 * Next 16 requires `outputFileTracingRoot` and `turbopack.root` to match.
 * Locally pin to this app; on Vercel monorepo checkouts match the repo tracing root.
 */
const projectRoot =
  process.env.VERCEL && isMonorepoCheckout ? repoRoot : appRoot;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.up.railway.app" },
      { protocol: "https", hostname: "*.vercel.app" },
      { protocol: "http", hostname: "localhost", port: "8000" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

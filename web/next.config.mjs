/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true
  },
  // Bridge the server-only TARGET_UI_PATH into a public var so client
  // components (NodeDetailPanel) can tell UI-layer nodes apart without
  // duplicating the target-repo config in two places.
  env: {
    NEXT_PUBLIC_UI_SCAN_DIR: process.env.TARGET_UI_PATH || "src/components"
  },
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"]
    };
    return config;
  }
};

export default nextConfig;

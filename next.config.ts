import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Social cards read fonts and avatars from disk at runtime (e.g. /ask/* on demand).
  outputFileTracingIncludes: { "/**": ["./assets/fonts/**", "./assets/og/**"] },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "github.com", pathname: "/*.png" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async rewrites() {
    // Markdown twins of every episode for LLM crawlers: /episodes/<slug>.md
    return [
      { source: "/episodes/:slug.md", destination: "/md/episodes/:slug" },
      { source: "/topics/:slug.md", destination: "/md/topics/:slug" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

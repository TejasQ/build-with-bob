import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WebMcpTools } from "@/components/webmcp/webmcp-tools";
import { baseMetadata } from "@/lib/seo/metadata";
import { plexMono, plexSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1116" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 rounded-full px-4 py-2 text-white bg-bob-gradient focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <WebMcpTools />
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { absoluteUrl, site } from "@/lib/site";

export const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: Build Real Apps Live with IBM Bob`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [
    { name: "Tejas Kumar", url: "https://tej.as" },
    { name: "David Jones-Gilardi", url: "https://davidgilardi.dev" },
  ],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} episodes` }],
      "text/plain": [{ url: "/llms.txt", title: "llms.txt" }],
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

type PageMeta = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  /** Social card path; defaults to the site-wide card. */
  image?: string;
};

/** Per-page metadata with canonical + matching OG/Twitter fields. */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  image = "/opengraph-image",
}: PageMeta): Metadata {
  return {
    // Skip the " | Building with Bob" suffix when it would push the title past ~60 chars.
    title: absoluteTitle || title.length > 40 ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: site.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
      images: [image],
    },
  };
}

import type { Guide } from "@/lib/content/schema";
import { absoluteUrl, hosts } from "@/lib/site";
import { ids } from "./jsonld";

export const guideArticle = (guide: Guide, episodeUrls: string[]) => ({
  "@type": "Article",
  "@id": `${absoluteUrl(guide.url)}#article`,
  headline: guide.h1,
  name: guide.title,
  description: guide.description,
  abstract: guide.answer,
  url: absoluteUrl(guide.url),
  mainEntityOfPage: absoluteUrl(guide.url),
  image: absoluteUrl(`${guide.url}/opengraph-image`),
  dateModified: guide.updated,
  datePublished: guide.updated,
  wordCount: guide.wordCount,
  inLanguage: "en",
  author: hosts.map((h) => ({ "@id": ids.person(h.id) })),
  publisher: { "@id": ids.organization },
  isPartOf: { "@id": ids.website },
  about: guide.about.map((name) => ({ "@type": "Thing", name })),
  citation: episodeUrls.map((url) => ({ "@id": `${absoluteUrl(url)}#article` })),
});

export const guideFaq = (guide: Guide) => ({
  "@type": "FAQPage",
  "@id": `${absoluteUrl(guide.url)}#faq`,
  mainEntity: guide.faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

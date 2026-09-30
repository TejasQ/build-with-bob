import type { Episode } from "@/lib/content/schema";
import { absoluteUrl, hosts } from "@/lib/site";
import { isoDuration } from "@/lib/time";
import { ids } from "./jsonld";

export function videoObject(episode: Episode) {
  const pageUrl = absoluteUrl(episode.url);
  const chapters = episode.chapters;
  return {
    "@type": "VideoObject",
    "@id": `${pageUrl}#video`,
    name: episode.title,
    description: episode.description,
    thumbnailUrl: [
      episode.thumbnail,
      `https://i.ytimg.com/vi/${episode.videoId}/hqdefault.jpg`,
    ],
    uploadDate: `${episode.date}T16:00:00Z`,
    duration: isoDuration(episode.duration),
    embedUrl: `https://www.youtube-nocookie.com/embed/${episode.videoId}`,
    url: pageUrl,
    inLanguage: "en",
    isPartOf: { "@id": ids.series },
    publisher: { "@id": ids.organization },
    actor: hosts.map((h) => ({ "@id": ids.person(h.id) })),
    keywords: [...episode.topics, ...episode.tools].join(", "),
    hasPart: chapters.map((c, i) => ({
      "@type": "Clip",
      name: c.title,
      startOffset: c.start,
      endOffset: chapters[i + 1]?.start ?? episode.duration,
      url: `${pageUrl}?t=${c.start}`,
    })),
    potentialAction: {
      "@type": "SeekToAction",
      target: `${pageUrl}?t={seek_to_second_number}`,
      "startOffset-input": "required name=seek_to_second_number",
    },
  };
}

export function blogPosting(episode: Episode) {
  const pageUrl = absoluteUrl(episode.url);
  return {
    "@type": "BlogPosting",
    "@id": `${pageUrl}#article`,
    headline: episode.title,
    description: episode.description,
    abstract: episode.tldr,
    url: pageUrl,
    mainEntityOfPage: pageUrl,
    image: absoluteUrl(`${episode.url}/opengraph-image`),
    datePublished: episode.date,
    dateModified: episode.date,
    wordCount: episode.wordCount,
    inLanguage: "en",
    author: hosts.map((h) => ({ "@id": ids.person(h.id) })),
    publisher: { "@id": ids.organization },
    isPartOf: { "@id": ids.series },
    video: { "@id": `${pageUrl}#video` },
    about: episode.tools.map((name) => ({ "@type": "Thing", name })),
    keywords: episode.topics,
  };
}

export const faqPage = (episode: Episode) => ({
  "@type": "FAQPage",
  "@id": `${absoluteUrl(episode.url)}#faq`,
  mainEntity: episode.faq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

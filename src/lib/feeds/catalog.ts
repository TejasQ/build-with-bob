import { getEpisodes } from "@/lib/content/episodes";
import { getGuides } from "@/lib/content/guides";
import { getProjects } from "@/lib/content/projects";
import { absoluteUrl } from "@/lib/site";

/** Compact machine-readable catalog served at /catalog.json (used by WebMCP tools). */
export function buildCatalog() {
  return {
    episodes: getEpisodes().map((e) => ({
      number: e.number,
      project: e.project,
      part: e.part,
      slug: e.slug,
      title: e.title,
      date: e.date,
      durationSeconds: e.duration,
      description: e.description,
      tldr: e.tldr,
      tools: e.tools,
      url: absoluteUrl(e.url),
      markdownUrl: absoluteUrl(`${e.url}.md`),
      youtubeUrl: `https://www.youtube.com/watch?v=${e.videoId}`,
      chapters: e.chapters,
    })),
    guides: getGuides().map((g) => ({
      slug: g.slug,
      title: g.h1,
      answer: g.answer,
      updated: g.updated,
      url: absoluteUrl(g.url),
      markdownUrl: absoluteUrl(`${g.url}.md`),
    })),
    projects: getProjects().map((p) => ({
      slug: p.slug,
      name: p.name,
      status: p.status,
      tagline: p.tagline,
      stack: p.stack,
      url: absoluteUrl(p.url),
    })),
  };
}

export type Catalog = ReturnType<typeof buildCatalog>;

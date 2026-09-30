import { logEmpty } from "@/lib/astra/log";
import type { MetadataRoute } from "next";
import { listIndexableQueries } from "@/lib/astra/queries";
import { getEpisodes } from "@/lib/content/episodes";
import { getGuides } from "@/lib/content/guides";
import { getProjects } from "@/lib/content/projects";
import { getHubTopics } from "@/lib/content/topics";
import { absoluteUrl, hosts } from "@/lib/site";

// Refreshed hourly so new question pages (/ask/*) are discovered quickly.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const questions = await listIndexableQueries(5000).catch(logEmpty);
  const episodes = getEpisodes();
  const latest = episodes[0]?.date;
  const page = (path: string, lastModified?: string, priority = 0.6) => ({
    url: absoluteUrl(path),
    lastModified,
    priority,
  });
  return [
    page("/", latest, 1),
    page("/episodes", latest, 0.9),
    page("/projects", latest, 0.7),
    page("/about", undefined, 0.5),
    page("/agents", undefined, 0.4),
    page("/ask", latest, 0.7),
    ...questions.map((q) => page(`/ask/${q._id}`, q.lastSeen.slice(0, 10), 0.6)),
    ...hosts.map((h) => page(`/hosts/${h.slug}`, latest, 0.5)),
    ...episodes.map((e) => ({
      ...page(e.url, e.date, 0.9),
      images: [e.thumbnail],
      videos: [
        {
          title: e.title,
          thumbnail_loc: e.thumbnail,
          description: e.description,
          player_loc: `https://www.youtube-nocookie.com/embed/${e.videoId}`,
          duration: e.duration,
          publication_date: e.date,
        },
      ],
    })),
    ...getProjects().map((p) => page(p.url, latest, 0.8)),
    page("/topics", latest, 0.7),
    ...getGuides().map((g) => page(g.url, g.updated, 0.9)),
    ...getHubTopics()
      .filter((t) => !getGuides().some((g) => g.slug === t.slug))
      .map((t) => page(`/topics/${t.slug}`, latest, 0.5)),
  ];
}

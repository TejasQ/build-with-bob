import "server-only";
import { slugify } from "@/lib/slug";
import { getEpisodes } from "./episodes";

export type Topic = { slug: string; name: string; count: number; kind: "tool" | "topic" };

export function getTopics(): Topic[] {
  const map = new Map<string, Topic>();
  for (const episode of getEpisodes()) {
    const tagged = [
      ...episode.tools.map((name) => ({ name, kind: "tool" as const })),
      ...episode.topics.map((name) => ({ name, kind: "topic" as const })),
    ];
    const seen = new Set<string>();
    for (const { name, kind } of tagged) {
      const slug = slugify(name);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const existing = map.get(slug);
      if (existing) existing.count += 1;
      else map.set(slug, { slug, name, count: 1, kind });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

export const getTopic = (slug: string) => getTopics().find((t) => t.slug === slug);

export const getEpisodesForTopic = (slug: string) =>
  getEpisodes().filter((e) =>
    [...e.tools, ...e.topics].some((name) => slugify(name) === slug),
  );

/** Topics covered by 3+ episodes get their own hub page (avoids thin pages). */
export const getHubTopics = () => getTopics().filter((t) => t.count >= 3);

export const getHubSlugs = () => new Set(getHubTopics().map((t) => t.slug));

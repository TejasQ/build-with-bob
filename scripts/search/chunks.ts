import { readJson, readMarkdownDir } from "../../src/lib/content/files";
import type { EpisodeMeta, TranscriptLine } from "../../src/lib/content/schema";
import { slugify } from "../../src/lib/slug";
import type { SearchChunk } from "../../src/lib/search/types";
import { guideChunks } from "./guide-chunks";
import { plain } from "./plain";

export type Draft = Omit<SearchChunk, "id">;

/** Transcript windows of ~2 caption paragraphs (~60s), plus article sections and FAQs. */
export function buildChunks(): SearchChunk[] {
  const metas = readJson<EpisodeMeta[]>("data/episodes.json");
  const posts = readMarkdownDir("content/episodes");
  const drafts: Draft[] = [];

  for (const meta of metas) {
    const post = posts.find((p) => p.data.videoId === meta.videoId);
    if (!post) continue;
    const base = `/episodes/${meta.slug}`;
    const common = { episode: meta.number, episodeTitle: String(post.data.title) };
    const lines = readJson<TranscriptLine[]>(`data/transcripts/${meta.videoId}.json`);
    const chapters = meta.chapters.length
      ? meta.chapters
      : ((post.data.chapters ?? []) as { start: number; title: string }[]);
    const chapterAt = (t: number) =>
      [...chapters].reverse().find((c) => c.start <= t)?.title ?? "Transcript";

    for (let i = 0; i < lines.length; i += 2) {
      const pair = lines.slice(i, i + 2);
      const start = pair[0].start;
      const text = pair.map((l) => l.text).join(" ");
      drafts.push({
        ...common,
        kind: "transcript",
        heading: chapterAt(start),
        text,
        start,
        url: `${base}?t=${start}`,
      });
    }
    for (const section of post.body.split(/^## /m).slice(1)) {
      const [heading, ...rest] = section.split("\n");
      const text = plain(rest.join(" "));
      if (text)
        drafts.push({
          ...common,
          kind: "article",
          heading,
          text,
          url: `${base}#${slugify(heading)}`,
        });
    }
    const faq = (post.data.faq ?? []) as { q: string; a: string }[];
    for (const { q, a } of faq) {
      drafts.push({
        ...common,
        kind: "faq",
        heading: q,
        text: `${q} ${a}`,
        url: `${base}#faq`,
      });
    }
  }
  drafts.push(...guideChunks());
  return drafts.map((d, id) => ({ id, ...d }));
}

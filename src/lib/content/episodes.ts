import "server-only";
import { cache } from "react";
import { readJson, readMarkdownDir } from "./files";
import {
  episodeFrontmatterSchema,
  episodeMetaSchema,
  type Episode,
  type TranscriptLine,
} from "./schema";

/** Published episodes (a data/episodes.json entry + a content/episodes post), newest first. */
export const getEpisodes = cache((): Episode[] => {
  const metas = episodeMetaSchema.array().parse(readJson("data/episodes.json"));
  const posts = readMarkdownDir("content/episodes").map(({ file, data, body }) => {
    const parsed = episodeFrontmatterSchema.safeParse(data);
    if (!parsed.success)
      throw new Error(`Invalid frontmatter in ${file}: ${parsed.error}`);
    return { ...parsed.data, body };
  });
  return metas
    .flatMap((meta) => {
      const post = posts.find((p) => p.videoId === meta.videoId);
      if (!post) return [];
      const chapters = meta.chapters.length ? meta.chapters : (post.chapters ?? []);
      const wordCount = post.body.split(/\s+/).length;
      return [{ ...post, ...meta, chapters, wordCount, url: `/episodes/${meta.slug}` }];
    })
    .sort((a, b) => b.number - a.number);
});

export const getEpisode = (slug: string) => getEpisodes().find((e) => e.slug === slug);

export const getEpisodesForProject = (project: string) =>
  getEpisodes().filter((e) => e.project === project);

export const getAdjacentEpisodes = (episode: Episode) => {
  const all = getEpisodes();
  const i = all.findIndex((e) => e.slug === episode.slug);
  return { next: all[i - 1], previous: all[i + 1] };
};

export const getTranscript = cache((videoId: string) =>
  readJson<TranscriptLine[]>(`data/transcripts/${videoId}.json`),
);

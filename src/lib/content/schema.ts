import { z } from "zod";

export const chapterSchema = z.object({ start: z.number(), title: z.string() });

export const episodeMetaSchema = z.object({
  number: z.number(),
  part: z.number(),
  project: z.string(),
  videoId: z.string(),
  slug: z.string(),
  youtubeTitle: z.string(),
  date: z.string(),
  duration: z.number(),
  thumbnail: z.string().url(),
  youtubeDescription: z.string(),
  chapters: z.array(chapterSchema),
});

export const episodeFrontmatterSchema = z.object({
  slug: z.string(),
  videoId: z.string(),
  title: z.string(),
  description: z.string(),
  tldr: z.string(),
  project: z.string(),
  topics: z.array(z.string()),
  tools: z.array(z.string()),
  takeaways: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  chapters: z.array(chapterSchema).optional(),
});

export const projectFrontmatterSchema = z.object({
  slug: z.string(),
  name: z.string(),
  title: z.string().optional(),
  tagline: z.string(),
  description: z.string(),
  status: z.string(),
  stack: z.array(z.string()),
  started: z.string(),
  repo: z.string().url().optional(),
  order: z.number().default(0),
});

export type Chapter = z.infer<typeof chapterSchema>;
export type EpisodeMeta = z.infer<typeof episodeMetaSchema>;
export type EpisodeFrontmatter = z.infer<typeof episodeFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;

export type Episode = EpisodeMeta &
  EpisodeFrontmatter & { body: string; wordCount: number; url: string };

export type Project = ProjectFrontmatter & { body: string; url: string };

export type TranscriptLine = { start: number; text: string };

export const guideFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  h1: z.string(),
  description: z.string(),
  answer: z.string(),
  updated: z.string(),
  about: z.array(z.string()),
  episodes: z.array(z.string()),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
});

export type Guide = z.infer<typeof guideFrontmatterSchema> & {
  body: string;
  url: string;
  wordCount: number;
};

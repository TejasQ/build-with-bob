import "server-only";
import { cache } from "react";
import { readMarkdownDir } from "./files";
import { guideFrontmatterSchema, type Guide } from "./schema";

export const getGuides = cache((): Guide[] =>
  readMarkdownDir("content/topics").map(({ file, data, body }) => {
    const parsed = guideFrontmatterSchema.safeParse({
      ...data,
      updated:
        data.updated instanceof Date
          ? data.updated.toISOString().slice(0, 10)
          : data.updated,
    });
    if (!parsed.success)
      throw new Error(`Invalid frontmatter in ${file}: ${parsed.error}`);
    return {
      ...parsed.data,
      body,
      url: `/topics/${parsed.data.slug}`,
      wordCount: body.split(/\s+/).length,
    };
  }),
);

export const getGuide = (slug: string) => getGuides().find((g) => g.slug === slug);

export const getGuidesForEpisode = (slug: string) =>
  getGuides().filter((g) => g.episodes.includes(slug));

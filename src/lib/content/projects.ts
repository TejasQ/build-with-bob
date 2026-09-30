import "server-only";
import { cache } from "react";
import { readMarkdownDir } from "./files";
import { projectFrontmatterSchema, type Project } from "./schema";

export const getProjects = cache((): Project[] =>
  readMarkdownDir("content/projects")
    .map(({ file, data, body }) => {
      const parsed = projectFrontmatterSchema.safeParse(data);
      if (!parsed.success)
        throw new Error(`Invalid frontmatter in ${file}: ${parsed.error}`);
      return { ...parsed.data, body, url: `/projects/${parsed.data.slug}` };
    })
    .sort((a, b) => b.order - a.order),
);

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug);

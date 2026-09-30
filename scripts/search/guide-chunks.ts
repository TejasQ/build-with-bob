import { readMarkdownDir } from "../../src/lib/content/files";
import { slugify } from "../../src/lib/slug";
import type { Draft } from "./chunks";
import { plain } from "./plain";

/** Guide sections; episode 0 marks non-episode content. */
export function guideChunks(): Draft[] {
  return readMarkdownDir("content/topics").flatMap(({ data, body }) =>
    body
      .split(/^## /m)
      .slice(1)
      .map((section) => {
        const [heading, ...rest] = section.split("\n");
        const url = `/topics/${data.slug}#${slugify(heading)}`;
        const common = { episode: 0, episodeTitle: String(data.h1) };
        return {
          ...common,
          kind: "guide" as const,
          heading,
          text: plain(rest.join(" ")),
          url,
        };
      }),
  );
}

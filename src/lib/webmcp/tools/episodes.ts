import { findEpisode, loadCatalog } from "../catalog";
import { failure, text } from "../registry";
import type { WebMcpTool } from "../types";

export const listEpisodesTool: WebMcpTool = {
  name: "list_episodes",
  title: "List episodes",
  description:
    "List every Building with Bob episode (newest first) with number, slug, title, date, summary, tools used and URLs.",
  inputSchema: { type: "object", properties: {} },
  annotations: { readOnlyHint: true },
  async execute() {
    const { episodes } = await loadCatalog();
    return text(
      episodes.map(({ chapters, ...rest }) => ({
        ...rest,
        chapterCount: chapters.length,
      })),
    );
  },
};

type GetInput = { episode: string };

export const getEpisodeTool: WebMcpTool<GetInput> = {
  name: "get_episode",
  title: "Read an episode",
  description:
    "Get the full write-up of one episode as Markdown: TL;DR, key takeaways, chapters, article, FAQ and full transcript. Accepts an episode slug or number.",
  inputSchema: {
    type: "object",
    properties: {
      episode: { type: "string", description: "Episode slug or number, e.g. '3'" },
    },
    required: ["episode"],
  },
  annotations: { readOnlyHint: true },
  async execute({ episode }) {
    const found = await findEpisode(episode);
    if (!found)
      return failure(`No episode matches "${episode}". Call list_episodes first.`);
    const markdown = await fetch(new URL(found.markdownUrl).pathname).then((r) =>
      r.text(),
    );
    return text(markdown);
  },
};

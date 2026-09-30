import { fetchSearch } from "@/lib/search/client";
import { absoluteUrlClient } from "../url";
import { failure, text } from "../registry";
import type { WebMcpTool } from "../types";

type Input = { query: string; limit?: number };

export const searchTranscriptsTool: WebMcpTool<Input> = {
  name: "search_transcripts",
  title: "Search Building with Bob",
  description:
    "Hybrid (vector + keyword, reranked) search across every Building with Bob episode transcript, write-up, FAQ and guide. Use for any question about what was said, built, decided or debugged on the show. Returns ranked passages with episode, timestamp and a deep link that plays the video at that moment.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Natural-language question or keywords, e.g. 'why did hosted Docling fail on audio'",
      },
      limit: {
        type: "number",
        description: "Max results (1-20, default 8)",
        minimum: 1,
        maximum: 20,
      },
    },
    required: ["query"],
  },
  annotations: { readOnlyHint: true },
  async execute({ query, limit = 8 }) {
    if (!query?.trim()) return failure("query is required");
    const { results: hits, error } = await fetchSearch(
      query.trim(),
      Math.min(20, Math.max(1, limit)),
    );
    if (error) return failure(error);
    return text({
      query,
      results: hits.map((h) => ({
        episode: h.episode,
        episodeTitle: h.episodeTitle,
        type: h.kind,
        section: h.heading,
        startSeconds: h.start,
        passage: h.text,
        url: absoluteUrlClient(h.url),
      })),
    });
  },
};

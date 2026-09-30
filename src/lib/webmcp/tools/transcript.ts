import { findEpisode } from "../catalog";
import { failure, text } from "../registry";
import type { WebMcpTool } from "../types";

type Input = { episode: string; fromSeconds?: number; toSeconds?: number };

const toSeconds = (stamp: string) =>
  stamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);

export const getTranscriptTool: WebMcpTool<Input> = {
  name: "get_transcript",
  title: "Read part of a transcript",
  description:
    "Return the timestamped transcript of an episode, optionally limited to a time range in seconds. Use after search_transcripts to read the context around a moment.",
  inputSchema: {
    type: "object",
    properties: {
      episode: { type: "string", description: "Episode slug or number" },
      fromSeconds: {
        type: "number",
        description: "Start of range in seconds (default 0)",
      },
      toSeconds: { type: "number", description: "End of range in seconds (default end)" },
    },
    required: ["episode"],
  },
  annotations: { readOnlyHint: true },
  async execute({ episode, fromSeconds = 0, toSeconds: to = Infinity }) {
    const found = await findEpisode(episode);
    if (!found) return failure(`No episode matches "${episode}".`);
    const markdown = await fetch(new URL(found.markdownUrl).pathname).then((r) =>
      r.text(),
    );
    const transcript = markdown.split(/^## Transcript$/m)[1] ?? "";
    const lines = transcript.split("\n").filter((line) => {
      const stamp = line.match(/^\[(\d+(?::\d+)+)\]/)?.[1];
      const t = stamp ? toSeconds(stamp) : -1;
      return t >= fromSeconds - 30 && t <= to;
    });
    if (!lines.length) return failure("No transcript in that range.");
    return text(`# ${found.title} (episode ${found.number})\n\n${lines.join("\n\n")}`);
  },
};

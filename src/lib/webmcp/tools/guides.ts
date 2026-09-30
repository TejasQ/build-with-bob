import { loadCatalog } from "../catalog";
import { failure, text } from "../registry";
import type { WebMcpTool } from "../types";

type Input = { guide?: string };

export const getGuideTool: WebMcpTool<Input> = {
  name: "get_guide",
  title: "Read a guide",
  description:
    "Read an in-depth Building with Bob guide as Markdown (e.g. what IBM Bob is, Docling audio transcription, audio chunking, coordinating coding agents). Call without arguments to list available guides.",
  inputSchema: {
    type: "object",
    properties: {
      guide: { type: "string", description: "Guide slug; omit to list all guides" },
    },
  },
  annotations: { readOnlyHint: true },
  async execute({ guide }) {
    const { guides } = await loadCatalog();
    if (!guide)
      return text(guides.map(({ slug, title, answer }) => ({ slug, title, answer })));
    const found = guides.find((g) => g.slug === guide.trim().toLowerCase());
    if (!found)
      return failure(
        `No guide "${guide}". Call get_guide with no arguments to list them.`,
      );
    return text(await fetch(new URL(found.markdownUrl).pathname).then((r) => r.text()));
  },
};

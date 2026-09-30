import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Building with Bob for AI agents";

export default staticOg({
  kind: "For agents",
  mascot: true,
  eyebrow: "WebMCP · llms.txt · Markdown",
  title: "Built for AI agents, too",
  chips: ["search_transcripts", "get_episode", "play_episode", "get_guide"],
});

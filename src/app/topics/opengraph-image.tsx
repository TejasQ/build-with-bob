import { getGuides } from "@/lib/content/guides";
import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Building with Bob guides";

export default staticOg(() => ({
  kind: "Guides",
  mascot: true,
  eyebrow: `${getGuides().length} first-hand guides`,
  title: "What we learned building with AI coding agents",
  chips: ["IBM Bob", "OpenRAG", "Docling", "Spec-driven development", "Agents"],
}));

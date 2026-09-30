import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Search every Building with Bob episode";

export default staticOg({
  kind: "Search",
  mascot: true,
  eyebrow: "Hybrid search on Astra DB",
  title: "Search every episode, jump to the exact moment",
  chips: ["Vector", "Keyword", "Reranked"],
});

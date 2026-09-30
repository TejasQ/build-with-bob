import { getProjects } from "@/lib/content/projects";
import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Open-source projects built on Building with Bob";

export default staticOg(() => ({
  kind: "Projects",
  eyebrow: "Open source, built live",
  title: "Real apps, from first plan to working product",
  chips: getProjects().map((p) => p.name),
}));

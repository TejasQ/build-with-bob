import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "About Building with Bob";

export default staticOg({
  kind: "About",
  mascot: true,
  eyebrow: "The show",
  title: "Two developers, one AI coding agent, real open-source apps",
  subtitle: "Unscripted: the planning, the dead ends and the fixes stay in.",
});

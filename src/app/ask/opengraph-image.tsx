import { ogContentType, ogSize } from "@/lib/og/render";
import { staticOg } from "@/lib/og/static-page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Questions answered on Building with Bob";

export default staticOg({
  kind: "Questions",
  mascot: true,
  eyebrow: "Asked and answered",
  title: "Your questions, answered with the exact moment on stream",
});

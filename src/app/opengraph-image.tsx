import { ogCard, ogSize } from "@/lib/og/card";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Building with Bob: live builds with IBM Bob";

export default function Image() {
  return ogCard({ eyebrow: "Livestream", title: "Real apps, built live with IBM Bob" });
}

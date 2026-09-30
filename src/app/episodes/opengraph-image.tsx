import { getEpisodes } from "@/lib/content/episodes";
import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { PageCard } from "@/lib/og/templates/page";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Every Building with Bob episode";

export default async function Image() {
  const episodes = getEpisodes();
  return renderOg(
    await PageCard({
      kind: "Episodes",
      eyebrow: `${episodes.length} live builds`,
      title: "Every episode, with chapters, takeaways and transcripts",
      collage: episodes.slice(0, 3).map((e) => e.videoId),
    }),
  );
}

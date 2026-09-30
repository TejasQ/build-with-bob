import { getEpisode, getEpisodes } from "@/lib/content/episodes";
import { ogCard, ogSize } from "@/lib/og/card";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Building with Bob episode card";

export function generateStaticParams() {
  return getEpisodes().map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const episode = getEpisode((await params).slug);
  return ogCard({
    eyebrow: `Episode ${episode?.number ?? ""}`,
    title: episode?.title ?? "Building with Bob",
    footer: "Tejas Kumar & David Jones-Gilardi build live with IBM Bob",
  });
}

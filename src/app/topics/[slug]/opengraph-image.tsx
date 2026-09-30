import { getGuide, getGuides } from "@/lib/content/guides";
import { getHubTopics, getTopic } from "@/lib/content/topics";
import { ogCard, ogSize } from "@/lib/og/card";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Building with Bob guide";

export function generateStaticParams() {
  const slugs = new Set([...getGuides(), ...getHubTopics()].map((t) => t.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  return ogCard({
    eyebrow: guide ? "Guide" : "Topic",
    title: guide?.h1 ?? getTopic(slug)?.name ?? "Building with Bob",
    footer: guide
      ? `First-hand evidence from ${guide.episodes.length} live builds`
      : undefined,
  });
}

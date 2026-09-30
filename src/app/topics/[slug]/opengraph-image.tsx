import { getGuide, getGuides } from "@/lib/content/guides";
import { getHubTopics, getTopic } from "@/lib/content/topics";
import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { GuideCard } from "@/lib/og/templates/guide";
import { PageCard } from "@/lib/og/templates/page";
import { formatDate } from "@/lib/time";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Building with Bob guide";

export function generateStaticParams() {
  const slugs = new Set([...getGuides(), ...getHubTopics()].map((t) => t.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (guide) {
    return renderOg(
      GuideCard({
        title: guide.h1,
        answer: guide.answer,
        episodes: guide.episodes.length,
        updated: formatDate(guide.updated),
        about: guide.about,
      }),
    );
  }
  const topic = getTopic(slug);
  return renderOg(
    await PageCard({
      kind: topic?.kind === "tool" ? "Tool" : "Topic",
      eyebrow: `Covered in ${topic?.count ?? 0} episodes`,
      title: topic?.name ?? "Building with Bob",
      subtitle: "Every moment it comes up, with timestamps and transcripts.",
    }),
  );
}

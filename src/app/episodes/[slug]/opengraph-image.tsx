import { getEpisode, getEpisodes } from "@/lib/content/episodes";
import { getProject } from "@/lib/content/projects";
import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { EpisodeCard } from "@/lib/og/templates/episode";
import { formatDate, humanDuration } from "@/lib/time";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Building with Bob episode";

export const generateStaticParams = () => getEpisodes().map((e) => ({ slug: e.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEpisode((await params).slug)!;
  return renderOg(
    await EpisodeCard({
      number: e.number,
      project: getProject(e.project)?.name ?? e.project,
      part: e.part,
      title: e.title,
      date: formatDate(e.date),
      duration: humanDuration(e.duration),
      tools: e.tools.filter((t) => t !== "IBM Bob"),
      videoId: e.videoId,
    }),
  );
}

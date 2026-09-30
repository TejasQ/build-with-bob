import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodeArticle } from "@/components/episode/episode-article";
import { getEpisode, getEpisodes } from "@/lib/content/episodes";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEpisodes().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/episodes/[slug]">): Promise<Metadata> {
  const episode = getEpisode((await params).slug);
  if (!episode) return {};
  const base = pageMetadata({
    title: episode.title,
    description: episode.description,
    path: episode.url,
    image: `${episode.url}/opengraph-image`,
  });
  return {
    ...base,
    keywords: [...episode.topics, ...episode.tools],
    alternates: {
      ...base.alternates,
      types: { "text/markdown": absoluteUrl(`${episode.url}.md`) },
    },
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: episode.date,
      authors: ["Tejas Kumar", "David Jones-Gilardi"],
      tags: episode.topics,
      videos: [{ url: `https://www.youtube.com/embed/${episode.videoId}` }],
    },
  };
}

export default async function EpisodePage({ params }: PageProps<"/episodes/[slug]">) {
  const episode = getEpisode((await params).slug);
  if (!episode) notFound();
  return <EpisodeArticle episode={episode} />;
}

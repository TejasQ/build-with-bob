import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { TagList } from "@/components/tag-list";
import { VideoPlayer } from "@/components/video/video-player";
import { getAdjacentEpisodes, getTranscript } from "@/lib/content/episodes";
import { extractHeadings, renderMarkdown } from "@/lib/content/markdown";
import type { Episode } from "@/lib/content/schema";
import { getGuidesForEpisode, getGuides } from "@/lib/content/guides";
import { getProject } from "@/lib/content/projects";
import { getHubSlugs } from "@/lib/content/topics";
import { RelatedGuides } from "./related-guides";
import { blogPosting, faqPage, videoObject } from "@/lib/seo/episode-jsonld";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { ChapterList } from "./chapter-list";
import { EpisodeMeta } from "./episode-meta";
import { EpisodeNav } from "./episode-nav";
import { Faq } from "./faq";
import { Takeaways } from "./takeaways";
import { Tldr } from "./tldr";
import { Toc } from "./toc";
import { Transcript } from "./transcript";

export async function EpisodeArticle({ episode }: { episode: Episode }) {
  const transcript = getTranscript(episode.videoId);
  const html = await renderMarkdown(episode.body);
  const hubs = new Set([...getHubSlugs(), ...getGuides().map((g) => g.slug)]);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Episodes", path: "/episodes" },
    { name: `Episode ${episode.number}`, path: episode.url },
  ];

  return (
    <article className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <JsonLd
        data={graph(
          breadcrumbs(crumbs),
          videoObject(episode),
          blogPosting(episode),
          faqPage(episode),
        )}
      />
      <header className="max-w-3xl space-y-4">
        <Breadcrumbs items={crumbs} />
        <EpisodeMeta episode={episode} />
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          {episode.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          Hosted by{" "}
          <Link href="/hosts/tejas-kumar" className="text-accent-fg">
            Tejas Kumar
          </Link>{" "}
          and{" "}
          <Link href="/hosts/david-jones-gilardi" className="text-accent-fg">
            David Jones-Gilardi
          </Link>{" "}
          · Project:{" "}
          <Link href={`/projects/${episode.project}`} className="text-accent-fg">
            {getProject(episode.project)?.name ?? episode.project}
          </Link>
        </p>
      </header>
      <VideoPlayer
        videoId={episode.videoId}
        title={episode.title}
        thumbnail={episode.thumbnail}
      />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-10">
          <Tldr text={episode.tldr} />
          <Takeaways items={episode.takeaways} />
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
          <Faq items={episode.faq} />
          <Transcript lines={transcript} title={episode.title} />
        </div>
        <aside className="space-y-8 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
          <ChapterList chapters={episode.chapters} />
          <Toc headings={extractHeadings(episode.body)} />
          <TagList label="Tools" tags={episode.tools} linkable={hubs} />
        </aside>
      </div>
      <RelatedGuides guides={getGuidesForEpisode(episode.slug)} />
      <EpisodeNav {...getAdjacentEpisodes(episode)} />
    </article>
  );
}

import { Breadcrumbs } from "@/components/breadcrumbs";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { Faq } from "@/components/episode/faq";
import { Tldr } from "@/components/episode/tldr";
import { Toc } from "@/components/episode/toc";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { getEpisodes } from "@/lib/content/episodes";
import { extractHeadings, renderMarkdown } from "@/lib/content/markdown";
import type { Guide } from "@/lib/content/schema";
import { guideArticle, guideFaq } from "@/lib/seo/guide-jsonld";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/time";

export async function GuideArticle({ guide }: { guide: Guide }) {
  const episodes = getEpisodes().filter((e) => guide.episodes.includes(e.slug));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/topics" },
    { name: guide.h1, path: guide.url },
  ];
  return (
    <article className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <JsonLd
        data={graph(
          breadcrumbs(crumbs),
          guideArticle(
            guide,
            episodes.map((e) => e.url),
          ),
          guideFaq(guide),
        )}
      />
      <header className="max-w-3xl space-y-4">
        <Breadcrumbs items={crumbs} />
        <p className="text-sm text-muted-foreground">
          <span className="text-bob-gradient font-semibold">Guide</span> · Updated{" "}
          <time dateTime={guide.updated}>{formatDate(guide.updated)}</time> · From{" "}
          {episodes.length} live {episodes.length === 1 ? "episode" : "episodes"}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          {guide.h1}
        </h1>
      </header>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 space-y-10">
          <Tldr text={guide.answer} label="Short answer" />
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: await renderMarkdown(guide.body) }}
          />
          <Faq items={guide.faq} />
        </div>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Toc headings={extractHeadings(guide.body)} />
        </aside>
      </div>
      <section aria-labelledby="sources">
        <SectionHeading
          id="sources"
          eyebrow="Sources"
          title="Episodes this guide draws on"
        />
        <EpisodeGrid episodes={episodes} />
      </section>
    </article>
  );
}

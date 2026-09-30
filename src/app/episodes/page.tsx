import { Breadcrumbs } from "@/components/breadcrumbs";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { JsonLd } from "@/components/json-ld";
import { getEpisodes } from "@/lib/content/episodes";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const title = "All episodes";
const description =
  "Every Building with Bob episode: live builds with IBM Bob, with video, chapters, key takeaways, FAQs and full searchable transcripts.";

export const metadata = pageMetadata({ title, description, path: "/episodes" });

export default function EpisodesPage() {
  const episodes = getEpisodes();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Episodes", path: "/episodes" },
  ];
  const list = {
    "@type": "ItemList",
    name: title,
    itemListElement: episodes.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(e.url),
      name: e.title,
    })),
  };
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs), list)} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">All episodes</h1>
        <p className="text-lg font-light text-muted-foreground">{description}</p>
      </header>
      <EpisodeGrid episodes={episodes} />
    </div>
  );
}

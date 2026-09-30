import { Breadcrumbs } from "@/components/breadcrumbs";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { JsonLd } from "@/components/json-ld";
import { getEpisodesForTopic, type Topic } from "@/lib/content/topics";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";

export const describeTopic = (t: Topic) =>
  `${t.count} Building with Bob episodes that cover ${t.name}: live, unscripted builds with IBM Bob, with timestamps, takeaways and transcripts.`;

export function TopicHub({ topic }: { topic: Topic }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/topics" },
    { name: topic.name, path: `/topics/${topic.slug}` },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <JsonLd
        data={graph(breadcrumbs(crumbs), { "@type": "CollectionPage", name: topic.name })}
      />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold tracking-widest text-accent-fg uppercase">
          {topic.kind === "tool" ? "Tool" : "Topic"}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{topic.name}</h1>
        <p className="text-lg font-light text-muted-foreground">{describeTopic(topic)}</p>
      </header>
      <EpisodeGrid episodes={getEpisodesForTopic(topic.slug)} />
    </div>
  );
}

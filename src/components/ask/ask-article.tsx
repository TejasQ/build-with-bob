import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideGrid } from "@/components/guide/guide-grid";
import { JsonLd } from "@/components/json-ld";
import type { QueryDoc } from "@/lib/astra/queries";
import { astraSearch } from "@/lib/astra/search";
import { getGuides } from "@/lib/content/guides";
import { askJsonLd } from "@/lib/seo/ask-jsonld";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/time";
import { Moments } from "./moments";
import { ShortAnswer } from "./short-answer";

export async function AskArticle({ doc }: { doc: QueryDoc }) {
  // Re-run the search at render time so pages improve as new episodes and guides land.
  const fresh = await astraSearch(doc.query, 12).catch(() => []);
  const hits = fresh.length ? fresh : doc.results;
  const hitUrls = hits.map((h) => h.url.split(/[?#]/)[0]);
  const guides = getGuides()
    .filter(
      (g) =>
        hitUrls.includes(g.url) ||
        g.episodes.some((s) => hitUrls.includes(`/episodes/${s}`)),
    )
    .slice(0, 3);
  const best = hits.find((h) => h.kind !== "transcript") ?? hits[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Questions", path: "/ask" },
    { name: doc.question, path: `/ask/${doc._id}` },
  ];
  return (
    <article className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <JsonLd
        data={graph(breadcrumbs(crumbs), ...askJsonLd(doc, hits, best?.text ?? ""))}
      />
      <header className="space-y-4">
        <Breadcrumbs items={crumbs} />
        <p className="text-sm text-muted-foreground">
          <span className="text-bob-gradient font-semibold">Question</span> · Asked{" "}
          {doc.count} {doc.count === 1 ? "time" : "times"} · Updated{" "}
          <time dateTime={doc.lastSeen}>{formatDate(doc.lastSeen.slice(0, 10))}</time>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-5xl">
          {doc.question}
        </h1>
      </header>
      <ShortAnswer hits={hits} />
      <Moments hits={hits} />
      {guides.length > 0 && (
        <section aria-labelledby="go-deeper" className="space-y-4">
          <h2 id="go-deeper" className="text-2xl font-semibold tracking-tight">
            Go deeper
          </h2>
          <GuideGrid guides={guides} />
        </section>
      )}
      <p className="text-sm text-muted-foreground">
        Ask something else in{" "}
        <Link href="/search" className="text-accent-fg">
          search
        </Link>
        , or browse{" "}
        <Link href="/ask" className="text-accent-fg">
          every question
        </Link>
        .
      </p>
    </article>
  );
}

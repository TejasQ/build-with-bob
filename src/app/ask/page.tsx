import { logEmpty } from "@/lib/astra/log";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { listIndexableQueries } from "@/lib/astra/queries";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

const description =
  "Questions people ask about IBM Bob, OpenRAG, Docling, KillrCtx and Walfly, each answered with the exact moments from Building with Bob episodes.";

export const metadata = pageMetadata({
  title: "Questions answered on the show",
  description,
  path: "/ask",
});

export default async function AskIndexPage() {
  const questions = await listIndexableQueries(300).catch(logEmpty);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Questions", path: "/ask" },
  ];
  const list = {
    "@type": "ItemList",
    name: "Questions answered on Building with Bob",
    itemListElement: questions.map((q, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/ask/${q._id}`),
      name: q.question,
    })),
  };
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs), list)} />
      <Breadcrumbs items={crumbs} />
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">
          Questions answered on the show
        </h1>
        <p className="text-lg font-light text-muted-foreground">{description}</p>
      </header>
      <ul className="divide-y divide-border rounded-2xl border border-border">
        {questions.map((q) => (
          <li key={q._id}>
            <Link
              href={`/ask/${q._id}`}
              className="flex justify-between gap-4 p-4 hover:bg-nav-hover"
            >
              <span>{q.question}</span>
              <span className="shrink-0 text-sm text-muted-foreground">{q.count}×</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        Don&apos;t see yours?{" "}
        <Link href="/search" className="text-accent-fg">
          Search every episode
        </Link>
        ; good questions get their own page.
      </p>
    </div>
  );
}

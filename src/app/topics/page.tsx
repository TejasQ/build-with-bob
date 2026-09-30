import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideGrid } from "@/components/guide/guide-grid";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { getGuides } from "@/lib/content/guides";
import { getHubTopics } from "@/lib/content/topics";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const description =
  "First-hand guides from live builds: IBM Bob, Docling audio transcription, audio chunking and coordinating coding agents.";

export const metadata = pageMetadata({
  title: "Guides and topics",
  description,
  path: "/topics",
});

export default function TopicsPage() {
  const guides = getGuides();
  const guideSlugs = new Set(guides.map((g) => g.slug));
  const hubs = getHubTopics().filter((t) => !guideSlugs.has(t.slug));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/topics" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs))} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Guides</h1>
        <p className="text-lg font-light text-muted-foreground">{description}</p>
      </header>
      <GuideGrid guides={guides} />
      <section aria-labelledby="all-topics">
        <SectionHeading id="all-topics" eyebrow="Browse" title="More topics" />
        <ul className="flex flex-wrap gap-2">
          {hubs.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/topics/${t.slug}`}
                className="block rounded-full border border-border px-4 py-2 text-sm hover:bg-nav-hover"
              >
                {t.name} <span className="text-muted-foreground">· {t.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

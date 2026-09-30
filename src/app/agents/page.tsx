import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ToolTable } from "@/components/webmcp/tool-table";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const description =
  "How AI agents can use Building with Bob: WebMCP tools in the browser, llms.txt, Markdown versions of every episode and a JSON catalog.";

export const metadata = pageMetadata({
  title: "For AI agents",
  description,
  path: "/agents",
});

const endpoints = [
  {
    href: "/llms.txt",
    label: "/llms.txt",
    note: "Curated Markdown index of the site (llmstxt.org)",
  },
  {
    href: "/llms-full.txt",
    label: "/llms-full.txt",
    note: "Every write-up and transcript in one file",
  },
  {
    href: "/catalog.json",
    label: "/catalog.json",
    note: "Episodes, chapters and projects as JSON",
  },
  { href: "/feed.xml", label: "/feed.xml", note: "RSS feed of new episodes" },
];

export default function AgentsPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "For AI agents", path: "/agents" },
  ];
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs))} />
      <Breadcrumbs items={crumbs} />
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Built for <span className="text-bob-gradient">agents</span> too
        </h1>
        <p className="text-lg leading-relaxed font-light">{description}</p>
      </header>
      <section aria-labelledby="webmcp" className="space-y-4">
        <h2 id="webmcp" className="text-2xl font-semibold">
          WebMCP tools
        </h2>
        <p className="font-light text-muted-foreground">
          Every page registers these tools with{" "}
          <a
            className="text-accent-fg underline"
            href="https://webmachinelearning.github.io/webmcp/"
          >
            WebMCP
          </a>{" "}
          (<code className="font-mono text-sm">document.modelContext</code>), so a browser
          agent can search transcripts, read episodes and play a video at an exact second
          without scraping. The search form is also a declarative WebMCP tool.
        </p>
        <ToolTable />
      </section>
      <section aria-labelledby="endpoints" className="space-y-4">
        <h2 id="endpoints" className="text-2xl font-semibold">
          Machine-readable endpoints
        </h2>
        <ul className="space-y-2">
          {endpoints.map((e) => (
            <li key={e.href} className="flex flex-wrap gap-x-3">
              <a href={e.href} className="font-mono text-sm text-accent-fg">
                {e.label}
              </a>
              <span className="font-light text-muted-foreground">{e.note}</span>
            </li>
          ))}
          <li className="font-light text-muted-foreground">
            Append <code className="font-mono text-sm">.md</code> to any episode URL for
            its Markdown.
          </li>
        </ul>
      </section>
    </div>
  );
}

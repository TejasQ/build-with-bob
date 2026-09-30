import { Breadcrumbs } from "@/components/breadcrumbs";
import { HostCard } from "@/components/host-card";
import { JsonLd } from "@/components/json-ld";
import { hosts, site } from "@/lib/site";
import { breadcrumbs, graph, organization, people, series } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const description =
  "About Building with Bob: the livestream where Tejas Kumar and David Jones-Gilardi build open-source apps live with IBM Bob, IBM's AI coding agent.";

export const metadata = pageMetadata({
  title: "About the show",
  description,
  path: "/about",
});

export default function AboutPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">
      <JsonLd
        data={graph(
          breadcrumbs(crumbs),
          { "@type": "AboutPage", about: { "@id": series()["@id"] } },
          organization(),
          series(),
          ...people(),
        )}
      />
      <Breadcrumbs items={crumbs} />
      <header className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">About {site.name}</h1>
        <p className="text-lg leading-relaxed font-light">
          {site.name} is a livestream about what it is really like to build software with
          an AI coding agent. Tejas and David pick a real, open-source product, then plan,
          build, debug and review it live with{" "}
          <a className="text-accent-fg underline" href={site.bobUrl}>
            IBM Bob
          </a>
          . Nothing is scripted, so the dead ends and the fixes are part of the show.
        </p>
        <p className="leading-relaxed font-light text-muted-foreground">
          Not to be confused with IBM&apos;s own &ldquo;Build with Bob&rdquo; channel:{" "}
          <em>Building with Bob</em> is a livestream by Tejas Kumar and David
          Jones-Gilardi, building apps with IBM Bob, IBM&apos;s AI coding agent.
        </p>
      </header>
      <section aria-labelledby="hosts" className="space-y-6">
        <h2 id="hosts" className="text-2xl font-semibold">
          Hosts
        </h2>
        <ul className="grid gap-4">
          {hosts.map((h) => (
            <li key={h.id} id={h.id}>
              <HostCard host={h} link />
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="how" className="space-y-3">
        <h2 id="how" className="text-2xl font-semibold">
          How each episode is published
        </h2>
        <p className="leading-relaxed font-light">
          Every stream is published with the video, chapter markers, a written breakdown,
          key takeaways, an FAQ and the full transcript. Everything is searchable, so you
          can jump to the exact second a problem was solved.
        </p>
      </section>
    </div>
  );
}

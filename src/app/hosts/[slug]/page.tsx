import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { HostCard } from "@/components/host-card";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { getEpisodes } from "@/lib/content/episodes";
import { breadcrumbs, graph, people } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";
import { absoluteUrl, hosts } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => hosts.map((h) => ({ slug: h.slug }));

const findHost = (slug: string) => hosts.find((h) => h.slug === slug);

export async function generateMetadata({
  params,
}: PageProps<"/hosts/[slug]">): Promise<Metadata> {
  const host = findHost((await params).slug);
  if (!host) return {};
  return pageMetadata({
    title: `${host.name}, ${host.role.toLowerCase()} of Building with Bob`,
    description: `${host.bio} See every episode ${host.name} built live with IBM Bob.`,
    path: `/hosts/${host.slug}`,
  });
}

export default async function HostPage({ params }: PageProps<"/hosts/[slug]">) {
  const host = findHost((await params).slug);
  if (!host) notFound();
  const person = people().find((p) => p.name === host.name)!;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: host.name, path: `/hosts/${host.slug}` },
  ];
  const profile = {
    "@type": "ProfilePage",
    url: absoluteUrl(`/hosts/${host.slug}`),
    mainEntity: person,
  };
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs), profile)} />
      <Breadcrumbs items={crumbs} />
      <HostCard host={host} headingLevel="h1" />
      <section aria-labelledby="host-episodes">
        <SectionHeading
          id="host-episodes"
          eyebrow="Episodes"
          title={`Built live by ${host.name}`}
        />
        <EpisodeGrid episodes={getEpisodes()} />
      </section>
    </div>
  );
}

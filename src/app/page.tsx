import Link from "next/link";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { AboutShow } from "@/components/home/about-show";
import { GuideGrid } from "@/components/guide/guide-grid";
import { Hero } from "@/components/home/hero";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project/project-card";
import { SectionHeading } from "@/components/section-heading";
import { getEpisodes, getEpisodesForProject } from "@/lib/content/episodes";
import { getGuides } from "@/lib/content/guides";
import { getProjects } from "@/lib/content/projects";
import { showFaq } from "@/lib/content/show-faq";
import { graph, organization, people, series, website } from "@/lib/seo/jsonld";

const faqLd = {
  "@type": "FAQPage",
  mainEntity: showFaq.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function HomePage() {
  const episodes = getEpisodes();
  const projects = getProjects();
  return (
    <>
      <JsonLd data={graph(website(), organization(), series(), ...people(), faqLd)} />
      <Hero latest={episodes[0]} />
      <section aria-labelledby="latest" className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading id="latest" eyebrow="Episodes" title="Latest builds">
          <Link href="/episodes" className="text-sm text-accent-fg">
            All episodes →
          </Link>
        </SectionHeading>
        <EpisodeGrid episodes={episodes.slice(0, 6)} />
      </section>
      {getGuides().length > 0 && (
        <section aria-labelledby="guides" className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading id="guides" eyebrow="Guides" title="Learn from every build" />
          <GuideGrid guides={getGuides()} />
        </section>
      )}
      <section aria-labelledby="projects" className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading id="projects" eyebrow="Projects" title="What we're building" />
        <div className="grid gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              episodeCount={getEpisodesForProject(p.slug).length}
            />
          ))}
        </div>
      </section>
      <div className="py-12">
        <AboutShow />
      </div>
    </>
  );
}

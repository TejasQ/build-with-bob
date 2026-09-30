import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EpisodeGrid } from "@/components/episode/episode-grid";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading } from "@/components/section-heading";
import { getEpisodesForProject } from "@/lib/content/episodes";
import { renderMarkdown } from "@/lib/content/markdown";
import { getProject, getProjects } from "@/lib/content/projects";
import { projectLd } from "@/lib/seo/project-jsonld";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export const generateStaticParams = () => getProjects().map((p) => ({ slug: p.slug }));

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const title = project.title ?? project.name;
  return pageMetadata({ title, description: project.description, path: project.url });
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  const episodes = getEpisodesForProject(project.slug);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: project.name, path: project.url },
  ];
  return (
    <article className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs), projectLd(project, episodes))} />
      <header className="max-w-3xl space-y-4">
        <Breadcrumbs items={crumbs} />
        <p className="text-xs font-semibold tracking-widest text-accent-fg uppercase">
          Project · {project.status}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
          {project.name}
        </h1>
        <p className="text-xl font-light text-muted-foreground">{project.tagline}</p>
        {project.repo && (
          <a
            href={project.repo}
            className="inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-white bg-bob-gradient"
          >
            View the source on GitHub
          </a>
        )}
      </header>
      <div
        className="prose max-w-3xl"
        dangerouslySetInnerHTML={{ __html: await renderMarkdown(project.body) }}
      />
      <section aria-labelledby="project-episodes">
        <SectionHeading
          id="project-episodes"
          eyebrow="Build log"
          title={`Every ${project.name} episode`}
        />
        <EpisodeGrid episodes={[...episodes].reverse()} />
      </section>
    </article>
  );
}

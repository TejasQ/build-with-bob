import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project/project-card";
import { getEpisodesForProject } from "@/lib/content/episodes";
import { getProjects } from "@/lib/content/projects";
import { breadcrumbs, graph } from "@/lib/seo/jsonld";
import { pageMetadata } from "@/lib/seo/metadata";

const description =
  "Open-source projects built live on Building with Bob with IBM Bob, from first plan to working app, with every episode that shaped them.";

export const metadata = pageMetadata({
  title: "Projects",
  description,
  path: "/projects",
});

export default function ProjectsPage() {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <JsonLd data={graph(breadcrumbs(crumbs))} />
      <Breadcrumbs items={crumbs} />
      <header className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
        <p className="text-lg font-light text-muted-foreground">{description}</p>
      </header>
      <div className="grid gap-6">
        {getProjects().map((p) => (
          <ProjectCard
            key={p.slug}
            project={p}
            episodeCount={getEpisodesForProject(p.slug).length}
          />
        ))}
      </div>
    </div>
  );
}

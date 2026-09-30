import { getEpisodesForProject } from "@/lib/content/episodes";
import { getProject, getProjects } from "@/lib/content/projects";
import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { ProjectCard } from "@/lib/og/templates/project";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Open-source project built on Building with Bob";

export const generateStaticParams = () => getProjects().map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug)!;
  return renderOg(
    ProjectCard({
      name: p.name,
      tagline: p.tagline,
      stack: p.stack.filter((s) => s !== "IBM Bob"),
      status: p.status,
      repo: p.repo,
      episodes: getEpisodesForProject(p.slug).length,
    }),
  );
}

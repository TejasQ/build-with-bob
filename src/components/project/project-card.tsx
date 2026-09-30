import Link from "next/link";
import type { Project } from "@/lib/content/schema";

export function ProjectCard({
  project,
  episodeCount,
}: {
  project: Project;
  episodeCount: number;
}) {
  return (
    <article className="relative rounded-2xl border border-border p-8 bg-bob-feature">
      <p className="text-xs font-semibold tracking-widest text-accent-fg uppercase">
        {project.status} · {episodeCount} episodes
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">
        <Link href={project.url} className="after:absolute after:inset-0">
          {project.name}
        </Link>
      </h3>
      <p className="mt-3 max-w-2xl text-lg font-light">{project.tagline}</p>
      <ul className="mt-6 flex flex-wrap gap-2" aria-label="Stack">
        {project.stack.map((tech) => (
          <li key={tech} className="rounded-full bg-background/60 px-3 py-1 text-xs">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}

import type { Episode, Project } from "@/lib/content/schema";
import { absoluteUrl, hosts } from "@/lib/site";
import { ids } from "./jsonld";

export const projectLd = (project: Project, episodes: Episode[]) => ({
  "@type": "SoftwareSourceCode",
  "@id": `${absoluteUrl(project.url)}#project`,
  name: project.name,
  description: project.description,
  url: absoluteUrl(project.url),
  dateCreated: project.started,
  keywords: project.stack.join(", "),
  programmingLanguage: ["TypeScript", "Python"],
  ...(project.repo ? { codeRepository: project.repo } : {}),
  author: hosts.map((h) => ({ "@id": ids.person(h.id) })),
  isPartOf: { "@id": ids.series },
  subjectOf: episodes.map((e) => ({ "@id": `${absoluteUrl(e.url)}#article` })),
});

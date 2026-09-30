import { getEpisodes } from "@/lib/content/episodes";
import { absolutizeMarkdown } from "@/lib/content/markdown";
import { getGuides } from "@/lib/content/guides";
import { getProjects } from "@/lib/content/projects";
import { guideMarkdown } from "@/lib/feeds/guide-markdown";
import { episodeMarkdown } from "@/lib/feeds/episode-markdown";
import { llmsIndex } from "@/lib/feeds/llms";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const projects = getProjects().map(
    (p) =>
      `# Project: ${p.name}\n\n${p.description}\n\n${absolutizeMarkdown(p.body, absoluteUrl(p.url), site.url)}`,
  );
  const body = [
    llmsIndex(),
    ...getGuides().map(guideMarkdown),
    ...projects,
    ...getEpisodes().map((e) => episodeMarkdown(e)),
  ].join("\n\n---\n\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

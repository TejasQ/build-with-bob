import { getEpisodes } from "@/lib/content/episodes";
import { getGuides } from "@/lib/content/guides";
import { getProjects } from "@/lib/content/projects";
import { absoluteUrl, site } from "@/lib/site";
import { formatDate } from "@/lib/time";

/** llms.txt (https://llmstxt.org): a curated, Markdown map of the site for language models. */
export function llmsIndex(questions: { _id: string; question: string }[] = []): string {
  const episodes = getEpisodes();
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Building with Bob is an unscripted livestream. Hosts Tejas Kumar and David Jones-Gilardi build real open-source apps with IBM Bob (https://bob.ibm.com/), IBM's AI coding agent, and publish each episode with a written breakdown, chapters, FAQ and full transcript. Every episode and guide page has a Markdown twin at the same URL with `.md` appended. In-browser agents can also use the WebMCP tools documented at /agents.",
    "",
    "## Guides",
    ...getGuides().map(
      (g) =>
        `- [${g.h1}](${absoluteUrl(`${g.url}.md`)}): updated ${formatDate(g.updated)}. ${g.answer}`,
    ),
    "",
    "## Episodes",
    ...episodes.map(
      (e) =>
        `- [Episode ${e.number}: ${e.title}](${absoluteUrl(`${e.url}.md`)}): ${formatDate(e.date)}. ${e.description}`,
    ),
    "",
    "## Projects",
    ...getProjects().map((p) => `- [${p.name}](${absoluteUrl(p.url)}): ${p.description}`),
    "",
    ...(questions.length
      ? [
          "## Questions",
          ...questions.map((q) => `- [${q.question}](${absoluteUrl(`/ask/${q._id}`)})`),
          "",
        ]
      : []),
    "## Optional",
    `- [Full text of every episode](${absoluteUrl("/llms-full.txt")}): all write-ups and transcripts in one file`,
    `- [About the show and hosts](${absoluteUrl("/about")})`,
    `- [RSS feed](${absoluteUrl("/feed.xml")})`,
    "",
  ].join("\n");
}

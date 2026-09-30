import { getTranscript } from "@/lib/content/episodes";
import { absolutizeMarkdown } from "@/lib/content/markdown";
import type { Episode } from "@/lib/content/schema";
import { absoluteUrl, site } from "@/lib/site";
import { formatDate, formatTimestamp, humanDuration } from "@/lib/time";

/** Clean, self-contained Markdown for one episode (for /episodes/<slug>.md and llms-full.txt). */
export function episodeMarkdown(episode: Episode, withTranscript = true): string {
  const url = absoluteUrl(episode.url);
  const lines = [
    `# ${episode.title}`,
    "",
    `> ${episode.tldr}`,
    "",
    `- Show: ${site.name}, episode ${episode.number} (${episode.project} part ${episode.part})`,
    `- Hosts: Tejas Kumar, David Jones-Gilardi`,
    `- Published: ${formatDate(episode.date)} · ${humanDuration(episode.duration)}`,
    `- Page: ${url}`,
    `- Video: https://www.youtube.com/watch?v=${episode.videoId}`,
    `- Tools: ${episode.tools.join(", ")}`,
    "",
    "## Key takeaways",
    ...episode.takeaways.map((t) => `- ${t}`),
    "",
    "## Chapters",
    ...episode.chapters.map(
      (c) => `- [${formatTimestamp(c.start)}](${url}?t=${c.start}) ${c.title}`,
    ),
    "",
    absolutizeMarkdown(episode.body, url, site.url),
    "",
    "## FAQ",
    ...episode.faq.flatMap(({ q, a }) => [`### ${q}`, a, ""]),
  ];
  if (withTranscript) {
    lines.push("## Transcript", "");
    for (const l of getTranscript(episode.videoId))
      lines.push(`[${formatTimestamp(l.start)}] ${l.text}`, "");
  }
  return lines.join("\n");
}

import { absolutizeMarkdown } from "@/lib/content/markdown";
import type { Guide } from "@/lib/content/schema";
import { absoluteUrl, site } from "@/lib/site";
import { formatDate } from "@/lib/time";

/** Self-contained Markdown for one guide (for /topics/<slug>.md and llms-full.txt). */
export function guideMarkdown(guide: Guide): string {
  const url = absoluteUrl(guide.url);
  return [
    `# ${guide.h1}`,
    "",
    `> ${guide.answer}`,
    "",
    `- Source: ${site.name} (${url})`,
    `- Updated: ${formatDate(guide.updated)}`,
    `- About: ${guide.about.join(", ")}`,
    "",
    absolutizeMarkdown(guide.body, url, site.url),
    "",
    "## FAQ",
    ...guide.faq.flatMap(({ q, a }) => [`### ${q}`, a, ""]),
  ].join("\n");
}

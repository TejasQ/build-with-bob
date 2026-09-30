import "server-only";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { slugify } from "@/lib/slug";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeStringify);

export async function renderMarkdown(markdown: string): Promise<string> {
  const html = String(await processor.process(markdown));
  // Timestamp links like [12:34](?t=754) become in-page seek links.
  return html.replace(/<a href="\?t=(\d+)">/g, '<a href="?t=$1" data-seek="$1">');
}

export type Heading = { id: string; text: string };

export function extractHeadings(markdown: string): Heading[] {
  return [...markdown.matchAll(/^## (.+)$/gm)].map(([, text]) => {
    const clean = text.replace(/[*_`]/g, "").trim();
    return { id: slugify(clean), text: clean };
  });
}

/** Rewrite relative links for off-site Markdown consumers (llms.txt, .md routes). */
export function absolutizeMarkdown(markdown: string, pageUrl: string, origin: string) {
  return markdown
    .replace(/\]\(\?t=(\d+)\)/g, `](${pageUrl}?t=$1)`)
    .replace(/\]\((\/[^)]*)\)/g, `](${origin}$1)`);
}

import { getGuide, getGuides } from "@/lib/content/guides";
import { guideMarkdown } from "@/lib/feeds/guide-markdown";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => getGuides().map((g) => ({ slug: g.slug }));

export async function GET(_req: Request, ctx: RouteContext<"/md/topics/[slug]">) {
  const guide = getGuide((await ctx.params).slug);
  if (!guide) return new Response("Not found", { status: 404 });
  return new Response(guideMarkdown(guide), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
      Link: `<${absoluteUrl(guide.url)}>; rel="canonical"`,
    },
  });
}

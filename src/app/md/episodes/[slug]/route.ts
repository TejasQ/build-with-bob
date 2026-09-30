import { getEpisode, getEpisodes } from "@/lib/content/episodes";
import { episodeMarkdown } from "@/lib/feeds/episode-markdown";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export const generateStaticParams = () => getEpisodes().map((e) => ({ slug: e.slug }));

export async function GET(_req: Request, ctx: RouteContext<"/md/episodes/[slug]">) {
  const episode = getEpisode((await ctx.params).slug);
  if (!episode) return new Response("Not found", { status: 404 });
  return new Response(episodeMarkdown(episode), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex, follow",
      Link: `<${absoluteUrl(episode.url)}>; rel="canonical"`,
    },
  });
}

import { getEpisodes } from "@/lib/content/episodes";
import { escapeXml } from "@/lib/feeds/escape";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const items = getEpisodes()
    .map((e) => {
      const url = absoluteUrl(e.url);
      return `<item><title>${escapeXml(e.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${e.date}T16:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(e.tldr)}</description>${e.topics.map((t) => `<category>${escapeXml(t)}</category>`).join("")}</item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(site.name)}</title><link>${site.url}</link><description>${escapeXml(site.description)}</description><language>en</language><atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

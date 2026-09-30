/**
 * Crawl the sitemap of a running build and fail on SEO regressions or broken internal links.
 * Usage: pnpm audit:seo [baseUrl]   (default http://localhost:3000)
 */
import { all, internalLinks } from "./checks";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

async function main() {
  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => new URL(m[1]).pathname)
    .filter((p, i, a) => !/\.(jpg|png)$/.test(p) && a.indexOf(p) === i);
  const problems: string[] = [];
  const links = new Set<string>();
  const titles = new Map<string, string>();

  for (const path of paths) {
    const res = await fetch(BASE + path);
    if (!res.ok) {
      problems.push(`${path}: HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    for (const check of all)
      for (const p of check(html, path)) problems.push(`${path}: ${p}`);
    const t = html.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    if (titles.has(t)) problems.push(`${path}: duplicate title with ${titles.get(t)}`);
    titles.set(t, path);
    internalLinks(html).forEach((l) => links.add(l));
  }
  for (const link of links) {
    const res = await fetch(BASE + link, { method: "HEAD" });
    if (res.status >= 400) problems.push(`broken internal link: ${link} (${res.status})`);
  }
  console.log(`Audited ${paths.length} pages, ${links.size} internal links.`);
  problems.forEach((p) => console.log(`  ✗ ${p}`));
  if (problems.length) process.exit(1);
  console.log("  ✓ no problems");
}

main();

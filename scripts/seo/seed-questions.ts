/**
 * Seed /ask question pages from the GEO prompt lists in content/seo/keywords.md by running
 * each prompt through the live search API (which persists it). Usage:
 *   pnpm seed:questions [baseUrl]   (default http://localhost:3000)
 */
import { readFileSync } from "node:fs";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

/** Rows like "| 12 | How do I transcribe audio with Docling? | `/topics/...` |". */
function prompts(): string[] {
  const md = readFileSync("content/seo/keywords.md", "utf8");
  const rows = [...md.matchAll(/^\|\s*\d+\s*\|\s*([^|]+?\?)\s*\|/gm)].map((m) =>
    m[1].trim(),
  );
  return [...new Set(rows)];
}

async function main() {
  const list = prompts();
  console.log(`Seeding ${list.length} questions via ${BASE}/api/search`);
  for (const q of list) {
    const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(q)}&limit=12`);
    const body = (await res.json()) as { results: unknown[]; permalink?: string };
    console.log(
      `  ${res.status} ${String(body.results.length).padStart(2)} hits  ${body.permalink}`,
    );
  }
}

main();

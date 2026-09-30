import type { NextRequest } from "next/server";
import { recordQuery } from "@/lib/astra/queries";
import { astraSearch } from "@/lib/astra/search";

const MAX_QUERY = 300;

/**
 * GET /api/search?q=…&limit=… → hybrid (vector + BM25, reranked) hits from Astra DB.
 * Every search is persisted as a question page at /ask/<slug>.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().slice(0, MAX_QUERY);
  const limit = Math.min(20, Math.max(1, Number(params.get("limit")) || 12));
  if (query.length < 2) return Response.json({ query, results: [] });
  try {
    const results = await astraSearch(query, Math.max(limit, 12));
    // Persist before responding so the permalink (and its prefetch) never races the write.
    const slug = await recordQuery(query, results).catch((e) => {
      console.error("recordQuery", e);
      return null;
    });
    return Response.json(
      {
        query,
        results: results.slice(0, limit),
        permalink: slug ? `/ask/${slug}` : null,
      },
      { headers: { "X-Robots-Tag": "noindex" } },
    );
  } catch (error) {
    console.error("search failed", error);
    return Response.json(
      { query, results: [], error: "Search is temporarily unavailable." },
      { status: 503 },
    );
  }
}

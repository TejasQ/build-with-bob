import "server-only";
import type { SearchHit } from "@/lib/search/types";
import { searchCollection, type SearchDoc } from "./collection";

/**
 * Hybrid search in Astra DB: vector (vectorize) + lexical (BM25) candidates, reranked by
 * the collection's NVIDIA reranker. Returns [] when Astra isn't configured.
 */
export async function astraSearch(query: string, limit = 12): Promise<SearchHit[]> {
  const collection = searchCollection();
  if (!collection) return [];
  const cursor = collection.findAndRerank<SearchDoc>(
    {},
    {
      sort: { $hybrid: query },
      limit,
      hybridLimits: 40,
      includeScores: true,
      projection: { $vector: 0, buildId: 0 },
    },
  );
  const results = await cursor.toArray();
  return results.map(({ document: d, scores }, id) => ({
    id,
    kind: d.kind,
    episode: d.episode,
    episodeTitle: d.episodeTitle,
    heading: d.heading,
    text: d.text,
    url: d.url,
    start: d.start,
    score: Number(scores.$rerank ?? 0),
  }));
}

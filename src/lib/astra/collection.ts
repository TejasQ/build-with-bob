import { DataAPIClient, type Collection } from "@datastax/astra-db-ts";
import type { SearchChunk } from "@/lib/search/types";

export const COLLECTION = "bwb_search";

/**
 * Hybrid-search collection: NVIDIA embeddings computed by Astra (vectorize), BM25 lexical
 * index, and the NVIDIA reranker. Settings are immutable after creation, so changing them
 * means a new collection name.
 */
export const collectionDefinition = {
  vector: {
    dimension: 1024,
    metric: "cosine" as const,
    service: { provider: "nvidia", modelName: "nvidia/nv-embedqa-e5-v5" },
  },
  lexical: { enabled: true, analyzer: "standard" },
  rerank: {
    enabled: true,
    service: { provider: "nvidia", modelName: "nvidia/llama-3.2-nv-rerankqa-1b-v2" },
  },
};

export type SearchDoc = Omit<SearchChunk, "id"> & { _id: string; buildId: string };

export function astraDb() {
  const endpoint = process.env.ASTRA_DB_API_ENDPOINT;
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
  if (!endpoint || !token) return null;
  return new DataAPIClient({ logging: [] }).db(endpoint, { token });
}

export function searchCollection(): Collection<SearchDoc> | null {
  return astraDb()?.collection<SearchDoc>(COLLECTION) ?? null;
}

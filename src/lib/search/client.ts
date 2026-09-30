import type { SearchHit } from "./types";

export type SearchResponse = {
  query: string;
  results: SearchHit[];
  permalink?: string | null;
  error?: string;
};

/** Browser/WebMCP client for /api/search (Astra DB hybrid search). */
export async function fetchSearch(
  query: string,
  limit = 12,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const url = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  const res = await fetch(url, { signal });
  return (await res.json()) as SearchResponse;
}

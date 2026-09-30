export type ChunkKind = "transcript" | "article" | "faq" | "guide";

export type SearchChunk = {
  id: number;
  kind: ChunkKind;
  /** Global episode number; 0 for guides. */
  episode: number;
  episodeTitle: string;
  heading: string;
  text: string;
  url: string;
  start?: number;
};

export type SearchHit = SearchChunk & { score: number };

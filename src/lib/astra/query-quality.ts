/** Normalizes a search into a stable page slug and decides if it deserves to be indexed. */
export const MIN_TOP_SCORE = 3; // NVIDIA reranker: junk scores < 0, on-topic questions > 4

const BLOCKLIST = /\b(viagra|casino|porn|sex|crypto ?airdrop|loan|escort|betting|xxx)\b/i;

export function normalizeQuery(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s'?+#.,:()-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

export function querySlug(query: string): string {
  return normalizeQuery(query)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\+/g, "-plus-")
    .replace(/#/g, "-sharp-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** A query page is indexable only if it reads like a real question about the show's content. */
export function isIndexable(
  query: string,
  topScore: number,
  resultCount: number,
): boolean {
  const q = normalizeQuery(query);
  const words = q.split(" ").filter(Boolean);
  if (q.length < 6 || words.length < 2 || words.length > 16) return false;
  if (/https?:|www\.|@|\d{6,}/i.test(query) || BLOCKLIST.test(q)) return false;
  return resultCount >= 3 && topScore >= MIN_TOP_SCORE;
}

/** "how does killrctx work" -> "How does KillrCtx work?" (light touch; keeps user wording). */
export function displayQuestion(query: string): string {
  const q = normalizeQuery(query)
    .replace(/\bkillrctx\b/gi, "KillrCtx")
    .replace(/\bibm bob\b/gi, "IBM Bob");
  const cased = q.charAt(0).toUpperCase() + q.slice(1);
  const isQuestion =
    /^(how|what|why|when|where|which|who|is|are|can|does|do|should|will)\b/i.test(q);
  return isQuestion && !cased.endsWith("?") ? `${cased}?` : cased;
}

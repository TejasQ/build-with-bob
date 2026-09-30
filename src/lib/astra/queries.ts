import "server-only";
import type { SearchHit } from "@/lib/search/types";
import { astraDb } from "./collection";
import { displayQuestion, isIndexable, normalizeQuery, querySlug } from "./query-quality";

export const QUERIES = "bwb_queries";

export type QueryDoc = {
  _id: string;
  query: string;
  question: string;
  count: number;
  topScore: number;
  indexable: boolean;
  results: SearchHit[];
  firstSeen: string;
  lastSeen: string;
};

let ensured: Promise<unknown> | null = null;

/** Read handle; no round-trips. Writes call ensureCollection() once per process. */
function queries() {
  return astraDb()?.collection<QueryDoc>(QUERIES) ?? null;
}

function ensureCollection() {
  const db = astraDb();
  ensured ??= db
    ? db
        .listCollections({ nameOnly: true })
        .then((names) => (names.includes(QUERIES) ? null : db.createCollection(QUERIES)))
    : Promise.resolve(null);
  return ensured;
}

/** Upserts a search as a persisted question page (/ask/<slug>). Returns the slug. */
export async function recordQuery(
  raw: string,
  results: SearchHit[],
): Promise<string | null> {
  const query = normalizeQuery(raw);
  const slug = querySlug(query);
  const collection = queries();
  if (!collection || slug.length < 3) return null;
  await ensureCollection();
  const topScore = results[0]?.score ?? -Infinity;
  const now = new Date().toISOString();
  await collection.updateOne(
    { _id: slug },
    {
      $set: {
        query,
        question: displayQuestion(query),
        topScore,
        indexable: isIndexable(query, topScore, results.length),
        results: results.slice(0, 12),
        lastSeen: now,
      },
      $inc: { count: 1 },
      $setOnInsert: { firstSeen: now },
    },
    { upsert: true },
  );
  return slug;
}

export async function getQuery(slug: string): Promise<QueryDoc | null> {
  return (await queries()?.findOne({ _id: slug })) ?? null;
}

/** Indexable question pages, most-asked first (for sitemap, /ask hub, llms.txt). */
export async function listIndexableQueries(limit = 500): Promise<QueryDoc[]> {
  const collection = queries();
  if (!collection) return [];
  const docs = await collection
    .find({ indexable: true }, { projection: { results: 0 }, limit: 1000 })
    .toArray();
  return docs.sort((a, b) => b.count - a.count).slice(0, limit);
}

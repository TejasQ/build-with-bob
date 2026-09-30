/**
 * Sync every searchable chunk (transcripts, write-ups, FAQs, guides) into Astra DB.
 * Astra computes embeddings (vectorize) and the lexical index. Idempotent: stable _ids are
 * upserted, and anything from an older build is deleted. Skips when Astra isn't configured.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import {
  astraDb,
  COLLECTION,
  collectionDefinition,
  type SearchDoc,
} from "../src/lib/astra/collection";
import { buildChunks } from "./search/chunks";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const BATCH = 20;
const MAX_EMBED_CHARS = 1500; // keep vectorize input under the model's token limit

const stableId = (url: string, kind: string, text: string) =>
  createHash("sha1")
    .update(`${url}|${kind}|${text.slice(0, 200)}`)
    .digest("hex")
    .slice(0, 24);

async function main() {
  const db = astraDb();
  if (!db) return console.log("Astra DB not configured; skipping search index sync.");
  const names = await db.listCollections({ nameOnly: true });
  const collection = names.includes(COLLECTION)
    ? db.collection<SearchDoc>(COLLECTION)
    : await db.createCollection<SearchDoc>(COLLECTION, collectionDefinition);

  const buildId = new Date().toISOString();
  const docs = buildChunks().map(({ id: _id, ...chunk }) => ({
    ...chunk,
    _id: stableId(chunk.url, chunk.kind, chunk.text),
    buildId,
    $vectorize: `${chunk.heading}. ${chunk.text}`.slice(0, MAX_EMBED_CHARS),
    $lexical: `${chunk.heading}. ${chunk.episodeTitle}. ${chunk.text}`,
  }));
  console.log(`Syncing ${docs.length} chunks to Astra DB (${COLLECTION})…`);

  for (let i = 0; i < docs.length; i += BATCH) {
    await Promise.all(
      docs
        .slice(i, i + BATCH)
        .map(({ _id, ...doc }) => collection.replaceOne({ _id }, doc, { upsert: true })),
    );
    process.stdout.write(`\r${Math.min(i + BATCH, docs.length)}/${docs.length}`);
  }
  const { deletedCount } = await collection.deleteMany({ buildId: { $ne: buildId } });
  console.log(`\nDone. Removed ${deletedCount} stale chunks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

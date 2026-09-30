import type { Catalog } from "@/lib/feeds/catalog";

let promise: Promise<Catalog> | null = null;

export function loadCatalog(): Promise<Catalog> {
  promise ??= fetch("/catalog.json").then((r) => r.json() as Promise<Catalog>);
  return promise;
}

export async function findEpisode(slugOrNumber: string | number) {
  const { episodes } = await loadCatalog();
  const key = String(slugOrNumber).trim().toLowerCase();
  return episodes.find(
    (e) => e.slug === key || String(e.number) === key.replace(/^#|^episode\s*/, ""),
  );
}

import Link from "next/link";
import type { SearchHit } from "@/lib/search/types";

const firstSentences = (text: string, max = 2) =>
  (text.match(/[^.!?]+[.!?]+/g) ?? [text]).slice(0, max).join(" ").trim();

/** Extractive, answer-first summary: the best written passage (write-up, FAQ or guide), cited. */
export function ShortAnswer({ hits }: { hits: SearchHit[] }) {
  const best = hits.find((h) => h.kind !== "transcript") ?? hits[0];
  if (!best) return null;
  return (
    <div className="rounded-2xl border border-border p-6 bg-bob-feature">
      <p className="mb-2 text-xs font-semibold tracking-widest text-accent-fg uppercase">
        Short answer
      </p>
      <p className="text-lg leading-relaxed font-light">{firstSentences(best.text)}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        Source:{" "}
        <Link href={best.url} className="text-accent-fg underline">
          {best.heading} · {best.episodeTitle}
        </Link>
      </p>
    </div>
  );
}

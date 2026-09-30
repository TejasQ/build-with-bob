import Link from "next/link";
import type { SearchHit } from "@/lib/search/types";
import { formatTimestamp } from "@/lib/time";
import { Highlight } from "./highlight";

const labels = {
  transcript: "Transcript",
  article: "Write-up",
  faq: "FAQ",
  guide: "Guide",
} as const;

export function SearchHitCard({ hit, query }: { hit: SearchHit; query: string }) {
  return (
    <li className="relative rounded-2xl border border-border p-5 transition bg-bob-card hover:border-accent-fg/60">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-0.5 text-foreground">
          {labels[hit.kind]}
        </span>
        {hit.episode > 0 && <span>Episode {hit.episode}</span>}
        {hit.start !== undefined && (
          <span className="font-mono text-accent-fg">▶ {formatTimestamp(hit.start)}</span>
        )}
      </div>
      <h3 className="font-semibold">
        <Link href={hit.url} className="after:absolute after:inset-0">
          {hit.heading}
        </Link>
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{hit.episodeTitle}</p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed font-light text-foreground/85">
        <Highlight text={hit.text} query={query} />
      </p>
    </li>
  );
}

import Link from "next/link";
import type { Episode } from "@/lib/content/schema";

type Props = { previous?: Episode; next?: Episode };

export function EpisodeNav({ previous, next }: Props) {
  const cell = "border-border hover:bg-nav-hover block rounded-2xl border p-5";
  return (
    <nav aria-label="More episodes" className="grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link href={previous.url} rel="prev" className={cell}>
          <span className="text-xs text-muted-foreground">
            ← Episode {previous.number}
          </span>
          <span className="mt-1 block font-medium">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.url} rel="next" className={`${cell} sm:text-right`}>
          <span className="text-xs text-muted-foreground">Episode {next.number} →</span>
          <span className="mt-1 block font-medium">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}

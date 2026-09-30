import Link from "next/link";
import type { Guide } from "@/lib/content/schema";

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="relative flex h-full flex-col gap-3 rounded-2xl border border-border p-6 transition bg-bob-card hover:border-accent-fg/60">
      <p className="text-xs font-semibold tracking-widest text-accent-fg uppercase">
        Guide · {guide.episodes.length} episodes
      </p>
      <h3 className="text-lg leading-snug font-semibold">
        <Link href={guide.url} className="after:absolute after:inset-0">
          {guide.h1}
        </Link>
      </h3>
      <p className="line-clamp-3 text-sm font-light text-muted-foreground">
        {guide.description}
      </p>
    </article>
  );
}

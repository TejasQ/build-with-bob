import Link from "next/link";
import type { SearchHit } from "@/lib/search/types";
import { formatTimestamp } from "@/lib/time";

const label = {
  transcript: "Watch",
  article: "Read",
  faq: "FAQ",
  guide: "Guide",
} as const;

/** Every matching moment, grouped by source (episode or guide), best first. */
export function Moments({ hits }: { hits: SearchHit[] }) {
  const groups = new Map<string, SearchHit[]>();
  for (const hit of hits)
    groups.set(hit.episodeTitle, [...(groups.get(hit.episodeTitle) ?? []), hit]);
  return (
    <section aria-labelledby="moments" className="space-y-6">
      <h2 id="moments" className="text-2xl font-semibold tracking-tight">
        Where this comes up
      </h2>
      {[...groups].map(([title, items]) => (
        <div key={title} className="rounded-2xl border border-border p-5 bg-bob-card">
          <h3 className="font-semibold">
            {items[0].episode > 0 ? `Episode ${items[0].episode}: ` : "Guide: "}
            {title}
          </h3>
          <ul className="mt-3 space-y-3">
            {items.map((h) => (
              <li
                key={h.url + h.text.slice(0, 20)}
                className="text-sm leading-relaxed font-light"
              >
                <Link href={h.url} className="font-medium text-accent-fg">
                  {h.start !== undefined
                    ? `▶ ${formatTimestamp(h.start)}`
                    : label[h.kind]}
                  {" · "}
                  {h.heading}
                </Link>
                <p className="mt-1 line-clamp-3 text-foreground/80">{h.text}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

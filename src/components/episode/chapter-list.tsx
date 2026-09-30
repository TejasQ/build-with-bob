import type { Chapter } from "@/lib/content/schema";
import { formatTimestamp } from "@/lib/time";

export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  if (!chapters.length) return null;
  return (
    <section aria-labelledby="chapters" className="space-y-3">
      <h2 id="chapters" className="text-sm font-semibold tracking-wide uppercase">
        Chapters
      </h2>
      <ol className="space-y-1 text-sm">
        {chapters.map((c) => (
          <li key={c.start}>
            <a
              href={`?t=${c.start}`}
              data-seek={c.start}
              className="flex gap-3 rounded-lg px-2 py-1.5 hover:bg-nav-hover"
            >
              <time className="w-14 shrink-0 font-mono text-xs leading-5 text-accent-fg">
                {formatTimestamp(c.start)}
              </time>
              <span className="font-light">{c.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}

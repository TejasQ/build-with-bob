import type { TranscriptLine } from "@/lib/content/schema";
import { formatTimestamp } from "@/lib/time";

/** Full transcript in the HTML (indexable), collapsed by default for readers. */
export function Transcript({ lines, title }: { lines: TranscriptLine[]; title: string }) {
  return (
    <section aria-labelledby="transcript" className="space-y-4">
      <details className="group rounded-2xl border border-border bg-bob-card">
        <summary className="flex cursor-pointer list-none items-center justify-between p-5">
          <h2 id="transcript" className="text-xl font-semibold">
            Full transcript
          </h2>
          <span className="text-sm text-muted-foreground group-open:hidden">Show</span>
          <span className="hidden text-sm text-muted-foreground group-open:inline">
            Hide
          </span>
        </summary>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 pb-6" lang="en">
          <p className="text-sm font-light text-muted-foreground">
            Auto-generated transcript of “{title}”. Speaker changes are marked with a
            dash.
          </p>
          {lines.map((line) => (
            <p key={line.start} id={`t-${line.start}`} className="flex gap-4 font-light">
              <a
                href={`?t=${line.start}`}
                data-seek={line.start}
                className="w-16 shrink-0 font-mono text-xs leading-7 text-accent-fg"
              >
                {formatTimestamp(line.start)}
              </a>
              <span className="leading-7">{line.text}</span>
            </p>
          ))}
        </div>
      </details>
    </section>
  );
}

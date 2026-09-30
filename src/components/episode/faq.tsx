type Item = { q: string; a: string };

/** FAQ rendered as open <details> so every answer is visible to crawlers and users. */
export function Faq({
  items,
  heading = "Frequently asked questions",
}: {
  items: Item[];
  heading?: string;
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq" className="space-y-4">
      <h2 id="faq" className="text-2xl font-semibold tracking-tight">
        {heading}
      </h2>
      <div className="divide-y divide-border rounded-2xl border border-border">
        {items.map(({ q, a }) => (
          <details key={q} className="group p-5" open>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
              <h3>{q}</h3>
              <span
                className="text-muted-foreground transition group-open:rotate-45"
                aria-hidden="true"
              >
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed font-light text-foreground/85">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const STOP = new Set([
  "the",
  "and",
  "did",
  "how",
  "why",
  "what",
  "was",
  "for",
  "with",
  "you",
  "does",
  "they",
]);

/** Wraps query terms (3+ chars) in <mark>, and centers the snippet on the first match. */
export function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP.has(t.toLowerCase()))
    .map(escape);
  if (!terms.length) return <>{text}</>;
  const pattern = new RegExp(`(${terms.join("|")})`, "gi");
  const first = text.search(pattern);
  const snippet = first > 120 ? `…${text.slice(first - 80)}` : text;
  return (
    <>
      {snippet.split(pattern).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded bg-[var(--mark)] px-0.5 text-foreground">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

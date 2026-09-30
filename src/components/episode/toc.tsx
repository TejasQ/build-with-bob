import type { Heading } from "@/lib/content/markdown";

export function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null;
  return (
    <nav aria-labelledby="toc" className="space-y-3">
      <h2 id="toc" className="text-sm font-semibold tracking-wide uppercase">
        On this page
      </h2>
      <ul className="space-y-1.5 text-sm font-light">
        {headings.map((h) => (
          <li key={h.id}>
            <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

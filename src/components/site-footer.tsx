import Link from "next/link";
import { site } from "@/lib/site";

const links = [
  { href: "/episodes", label: "All episodes" },
  { href: "/projects", label: "Projects" },
  { href: "/search", label: "Search transcripts" },
  { href: "/feed.xml", label: "RSS feed" },
  { href: "/agents", label: "For AI agents" },
  { href: "/llms.txt", label: "llms.txt" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-nav-border bg-footer">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-2">
        <div className="space-y-2">
          <p className="font-semibold">{site.name}</p>
          <p className="max-w-sm font-light text-muted-foreground">{site.tagline}.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground sm:justify-end">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:text-foreground">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={site.youtubeChannel} className="hover:text-foreground" rel="me">
              YouTube
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

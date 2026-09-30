import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./logo";

const nav = [
  { href: "/episodes", label: "Episodes" },
  { href: "/topics", label: "Guides" },
  { href: "/projects", label: "Projects" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-nav-border bg-nav/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          aria-label={site.name}
        >
          <Logo className="size-7" />
          <span className="hidden sm:inline">{site.name}</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-0 text-[0.8125rem] sm:gap-1 sm:text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-full px-1.5 py-1.5 font-light hover:bg-nav-hover sm:px-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

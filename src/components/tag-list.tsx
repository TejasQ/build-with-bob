import Link from "next/link";
import { slugify } from "@/lib/slug";

type Props = { tags: string[]; linkable?: Set<string>; label: string };

/** Pill list; tags with a hub page (in `linkable`) link to /topics/<slug>. */
export function TagList({ tags, linkable, label }: Props) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const slug = slugify(tag);
        const pill = "rounded-full border border-border px-3 py-1 text-xs";
        return (
          <li key={tag}>
            {linkable?.has(slug) ? (
              <Link
                href={`/topics/${slug}`}
                className={`${pill} block hover:bg-nav-hover`}
              >
                {tag}
              </Link>
            ) : (
              <span className={`${pill} block text-muted-foreground`}>{tag}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

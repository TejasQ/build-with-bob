import Link from "next/link";

type Props = { count: number; permalink: string | null };

/** Result count plus a link to the persisted question page for this search. */
export function ResultsSummary({ count, permalink }: Props) {
  return (
    <p className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
      <span>
        {count} {count === 1 ? "result" : "results"} across every episode
      </span>
      {permalink && count > 0 && (
        <Link href={permalink} className="text-accent-fg">
          Permanent page for this question →
        </Link>
      )}
    </p>
  );
}

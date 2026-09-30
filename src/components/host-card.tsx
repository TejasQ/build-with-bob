import Image from "next/image";
import Link from "next/link";
import type { Host } from "@/lib/site";

type Props = { host: Host; headingLevel?: "h1" | "h3"; link?: boolean };

export function HostCard({ host, headingLevel = "h3", link }: Props) {
  const Heading = headingLevel;
  const big = headingLevel === "h1";
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border p-6 bg-bob-card sm:flex-row sm:items-center">
      <Image
        src={`https://github.com/${host.github}.png`}
        alt={`${host.name}`}
        width={big ? 112 : 72}
        height={big ? 112 : 72}
        className="rounded-full border-2 border-accent-fg/40"
      />
      <div className="space-y-2">
        <Heading
          className={
            big ? "text-4xl font-semibold tracking-tight" : "text-lg font-semibold"
          }
        >
          {link ? <Link href={`/hosts/${host.slug}`}>{host.name}</Link> : host.name}
        </Heading>
        <p className="text-sm text-accent-fg">{host.role}, Building with Bob</p>
        <p className="font-light text-muted-foreground">{host.bio}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {host.sameAs.map((url) => (
            <li key={url}>
              <a href={url} rel="me" className="text-accent-fg">
                {url.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

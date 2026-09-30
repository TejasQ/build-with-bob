import Image from "next/image";
import Link from "next/link";
import type { Episode } from "@/lib/content/schema";
import { EpisodeMeta } from "./episode-meta";

export function EpisodeCard({
  episode,
  priority,
}: {
  episode: Episode;
  priority?: boolean;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border transition bg-bob-card hover:-translate-y-0.5">
      <div className="relative aspect-video">
        <Image
          src={episode.thumbnail}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <EpisodeMeta episode={episode} compact />
        <h3 className="text-lg leading-snug font-semibold">
          <Link href={episode.url} className="after:absolute after:inset-0">
            {episode.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm font-light text-muted-foreground">
          {episode.description}
        </p>
      </div>
    </article>
  );
}

import type { Episode } from "@/lib/content/schema";
import { EpisodeCard } from "./episode-card";

export function EpisodeGrid({ episodes }: { episodes: Episode[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {episodes.map((episode, i) => (
        <li key={episode.slug} className="flex">
          <EpisodeCard episode={episode} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}

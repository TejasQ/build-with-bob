import { getProject } from "@/lib/content/projects";
import type { Episode } from "@/lib/content/schema";
import { formatDate, humanDuration, isoDuration } from "@/lib/time";

type Props = { episode: Episode; compact?: boolean };

export function EpisodeMeta({ episode, compact }: Props) {
  const project = getProject(episode.project)?.name ?? episode.project;
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span className="text-bob-gradient font-semibold">Episode {episode.number}</span>
      <span aria-hidden="true">·</span>
      <span>
        {project} part {episode.part}
      </span>
      {!compact && (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={episode.date}>{formatDate(episode.date)}</time>
          <span aria-hidden="true">·</span>
          <time dateTime={isoDuration(episode.duration)}>
            {humanDuration(episode.duration)}
          </time>
        </>
      )}
    </p>
  );
}

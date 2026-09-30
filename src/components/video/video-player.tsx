"use client";

import Image from "next/image";
import { useSeek } from "./use-seek";

type Props = { videoId: string; title: string; thumbnail: string };

/** Lightweight YouTube facade: poster image until play, then a privacy-enhanced embed. */
export function VideoPlayer({ videoId, title, thumbnail }: Props) {
  const { start, setStart } = useSeek("player");
  const playing = start !== null;

  return (
    <div
      id="player"
      className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-[#0f62fe]/10"
    >
      {playing ? (
        <iframe
          key={start}
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&start=${start}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setStart(0)}
          className="group absolute inset-0 size-full cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={thumbnail}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover opacity-90 transition group-hover:opacity-100"
          />
          <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3.5 text-sm font-medium text-white shadow-lg transition bg-bob-gradient group-hover:scale-105 sm:bottom-6 sm:left-6">
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Play episode
          </span>
        </button>
      )}
      <noscript>
        <a href={`https://www.youtube.com/watch?v=${videoId}`}>
          Watch “{title}” on YouTube
        </a>
      </noscript>
    </div>
  );
}

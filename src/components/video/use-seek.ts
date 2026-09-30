"use client";

import { useEffect, useState } from "react";
import { SEEK_EVENT } from "@/lib/webmcp/events";

const readT = () => {
  const t = Number(new URLSearchParams(window.location.search).get("t"));
  return Number.isFinite(t) && t > 0 ? Math.floor(t) : null;
};

/**
 * Tracks the requested start time. Honors `?t=` on load (Google key-moment links)
 * and intercepts clicks on any `a[data-seek]` so timestamps seek without a reload.
 */
export function useSeek(targetId: string) {
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    const initial = readT();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from URL once on mount
    if (initial !== null) setStart(initial);

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-seek]",
      );
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      const seconds = Number(link.dataset.seek);
      history.replaceState(null, "", `?t=${seconds}`);
      setStart(seconds);
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    const onSeek = (event: Event) => setStart((event as CustomEvent<number>).detail);
    document.addEventListener("click", onClick);
    window.addEventListener(SEEK_EVENT, onSeek);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener(SEEK_EVENT, onSeek);
    };
  }, [targetId]);

  return { start, setStart };
}

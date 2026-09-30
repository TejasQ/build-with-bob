"use client";

import { useEffect, useState } from "react";
import { fetchSearch } from "@/lib/search/client";
import type { SearchHit } from "@/lib/search/types";

export type SearchState = "idle" | "loading" | "done" | "error";

/** Debounced hybrid search against /api/search; cancels stale requests. */
export function useHybridSearch(query: string) {
  const [results, setResults] = useState<SearchHit[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [permalink, setPermalink] = useState<string | null>(null);
  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const res = await fetchSearch(trimmed, 15, controller.signal);
        setResults(res.results);
        setPermalink(res.permalink ?? null);
        setError(res.error ?? null);
        setState(res.error ? "error" : "done");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed]);

  return { results: trimmed.length < 2 ? [] : results, state, error, permalink };
}

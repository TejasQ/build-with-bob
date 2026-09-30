import type { SearchState } from "./use-hybrid-search";

const labels: Record<SearchState, string> = {
  idle: "Hybrid search: vector + keyword, reranked",
  loading: "Searching every episode…",
  done: "Vector + keyword results, reranked by relevance",
  error: "Search is temporarily unavailable",
};

export function SearchStatus({ state }: { state: SearchState }) {
  const dot =
    state === "done"
      ? "bg-[#42be65]"
      : state === "error"
        ? "bg-[#fa4d56]"
        : "bg-[#fdd13a]";
  return (
    <p
      className="flex items-center gap-2 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <span
        className={`size-2 rounded-full ${dot} ${state === "loading" ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      {labels[state]}
    </p>
  );
}

"use client";

import { useEffect, useState } from "react";
import { handleSearchSubmit } from "./agent-submit";
import { ResultsSummary } from "./results-summary";
import { SearchHitCard } from "./search-hit";
import { SearchStatus } from "./search-status";
import { useHybridSearch } from "./use-hybrid-search";

const suggestions = [
  "Why did hosted Docling fail on audio?",
  "coordinating multiple coding agents",
  "keyboard covering the chat input",
  "how big should audio chunks be",
  "Bob plan mode",
];

export function SearchClient() {
  const [query, setQuery] = useState("");
  const { results, state, error, permalink } = useHybridSearch(query);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from shareable URL once
    if (q) setQuery(q);
  }, []);

  const update = (value: string) => {
    setQuery(value);
    const url = value ? `?q=${encodeURIComponent(value)}` : window.location.pathname;
    history.replaceState(null, "", url);
  };

  return (
    <div className="space-y-6">
      <form
        role="search"
        toolname="search_transcripts_form"
        toolautosubmit=""
        tooldescription="Search every Building with Bob transcript, write-up and FAQ and show the matching moments to the user"
        onSubmit={(e) => handleSearchSubmit(e, update)}
        className="space-y-3"
      >
        <label htmlFor="q" className="sr-only">
          Search transcripts
        </label>
        <div className="relative">
          <input
            id="q"
            name="q"
            toolparamdescription="A natural-language question or keywords about anything discussed on the show"
            type="search"
            value={query}
            onChange={(e) => update(e.target.value)}
            placeholder="Ask anything, e.g. how did they fix the audio upload?"
            autoFocus
            autoComplete="off"
            className="w-full rounded-full py-4 pr-28 pl-6 text-lg font-light border-bob-gradient outline-none"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full px-5 py-2.5 text-sm font-medium text-white bg-bob-gradient"
          >
            Search
          </button>
        </div>
        <SearchStatus state={state} />
      </form>
      {error && <p className="text-[#fa4d56]">{error}</p>}
      {!query && (
        <ul className="flex flex-wrap gap-2" aria-label="Example searches">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => update(s)}
                className="rounded-full border border-border px-3 py-1.5 text-sm font-light hover:bg-nav-hover"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && state === "done" && (
        <ResultsSummary count={results.length} permalink={permalink} />
      )}
      <ul className="grid gap-4">
        {results.map((hit) => (
          <SearchHitCard key={hit.id} hit={hit} query={query} />
        ))}
      </ul>
    </div>
  );
}

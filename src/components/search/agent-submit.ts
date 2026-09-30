import type { FormEvent } from "react";
import { fetchSearch } from "@/lib/search/client";
import { absoluteUrlClient } from "@/lib/webmcp/url";
import type { AgentSubmitEvent } from "@/lib/webmcp/types";

/**
 * Declarative WebMCP: when an agent submits the search form, answer it directly with
 * results via SubmitEvent.respondWith() while also showing them to the user.
 */
export function handleSearchSubmit(
  event: FormEvent<HTMLFormElement>,
  onQuery: (q: string) => void,
) {
  event.preventDefault();
  const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
  onQuery(query);
  const native = event.nativeEvent as AgentSubmitEvent;
  if (!native.agentInvoked || !native.respondWith) return;
  native.respondWith(
    fetchSearch(query, 8).then(({ results }) =>
      results.map((h) => ({
        episode: h.episode,
        section: h.heading,
        startSeconds: h.start,
        passage: h.text,
        url: absoluteUrlClient(h.url),
      })),
    ),
  );
}

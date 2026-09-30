import type { Metadata } from "next";
import { SearchClient } from "@/components/search/search-client";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Search every transcript",
    description:
      "Semantic search across every Building with Bob episode. Ask a question in plain language and jump straight to the moment in the video.",
    path: "/search",
  }),
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Search <span className="text-bob-gradient">every episode</span>
        </h1>
        <p className="font-light text-muted-foreground">
          Hybrid search over every transcript, write-up, FAQ and guide: vector similarity
          and keyword matching in Astra DB, reranked for relevance. Ask in plain language
          and jump straight to the moment in the video.
        </p>
      </header>
      <SearchClient />
    </div>
  );
}

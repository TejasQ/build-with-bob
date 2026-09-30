import { getQuery } from "@/lib/astra/queries";
import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { PageCard } from "@/lib/og/templates/page";
import { QuestionCard } from "@/lib/og/templates/question";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Question answered on Building with Bob";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const doc = await getQuery((await params).slug).catch(() => null);
  if (!doc)
    return renderOg(await PageCard({ kind: "Question", title: "Ask Building with Bob" }));
  const best = doc.results.find((r) => r.kind !== "transcript") ?? doc.results[0];
  const sources = new Set(doc.results.map((r) => r.episodeTitle)).size;
  return renderOg(
    QuestionCard({
      question: doc.question,
      answer: best?.text,
      moments: doc.results.length,
      episodes: sources,
    }),
  );
}

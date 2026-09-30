import { logEmpty } from "@/lib/astra/log";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AskArticle } from "@/components/ask/ask-article";
import { getQuery, listIndexableQueries } from "@/lib/astra/queries";
import { pageMetadata } from "@/lib/seo/metadata";

// Question pages are rendered on first request, cached, and refreshed daily (ISR).
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  const docs = await listIndexableQueries(200).catch(logEmpty);
  return docs.map((d) => ({ slug: d._id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/ask/[slug]">): Promise<Metadata> {
  const doc = await getQuery((await params).slug);
  if (!doc) return {};
  const top = doc.results[0];
  const description = top
    ? `${doc.question} Answered with timestamped moments from Building with Bob: ${top.heading}.`.slice(
        0,
        158,
      )
    : doc.question;
  return {
    ...pageMetadata({ title: doc.question, description, path: `/ask/${doc._id}` }),
    robots: { index: doc.indexable, follow: true },
  };
}

export default async function AskPage({ params }: PageProps<"/ask/[slug]">) {
  const doc = await getQuery((await params).slug);
  if (!doc) notFound();
  return <AskArticle doc={doc} />;
}

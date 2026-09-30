import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guide/guide-article";
import { describeTopic, TopicHub } from "@/components/guide/topic-hub";
import { getGuide, getGuides } from "@/lib/content/guides";
import { getHubTopics, getTopic } from "@/lib/content/topics";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = new Set([...getGuides(), ...getHubTopics()].map((t) => t.slug));
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/topics/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (guide) {
    const base = pageMetadata({
      title: guide.title,
      description: guide.description,
      path: guide.url,
      image: `${guide.url}/opengraph-image`,
    });
    return {
      ...base,
      keywords: guide.about,
      alternates: {
        ...base.alternates,
        types: { "text/markdown": absoluteUrl(`${guide.url}.md`) },
      },
      openGraph: { ...base.openGraph, type: "article", modifiedTime: guide.updated },
    };
  }
  const topic = getTopic(slug);
  if (!topic) return {};
  return pageMetadata({
    title: `${topic.name} episodes`,
    description: describeTopic(topic),
    path: `/topics/${topic.slug}`,
    image: `/topics/${topic.slug}/opengraph-image`,
  });
}

export default async function TopicPage({ params }: PageProps<"/topics/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (guide) return <GuideArticle guide={guide} />;
  const topic = getTopic(slug);
  if (!topic) notFound();
  return <TopicHub topic={topic} />;
}

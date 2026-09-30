import type { QueryDoc } from "@/lib/astra/queries";
import type { SearchHit } from "@/lib/search/types";
import { absoluteUrl } from "@/lib/site";
import { ids } from "./jsonld";

const episodePath = (url: string) => url.split(/[?#]/)[0];

/** Question + extractive answer, and the matching moments as video Clips / article sections. */
export function askJsonLd(doc: QueryDoc, hits: SearchHit[], answer: string) {
  const url = absoluteUrl(`/ask/${doc._id}`);
  return [
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      url,
      name: doc.question,
      isPartOf: { "@id": ids.website },
      dateModified: doc.lastSeen,
      mainEntity: [
        {
          "@type": "Question",
          name: doc.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
            url: absoluteUrl(hits[0]?.url ?? "/"),
          },
        },
      ],
    },
    {
      "@type": "ItemList",
      name: `Moments that answer: ${doc.question}`,
      itemListElement: hits.map((h, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item:
          h.start !== undefined
            ? {
                "@type": "Clip",
                name: h.heading,
                url: absoluteUrl(h.url),
                startOffset: h.start,
                isPartOf: { "@id": `${absoluteUrl(episodePath(h.url))}#video` },
              }
            : { "@type": "WebPageElement", name: h.heading, url: absoluteUrl(h.url) },
      })),
    },
  ];
}

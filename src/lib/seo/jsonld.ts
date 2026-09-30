import { absoluteUrl, hosts, site } from "@/lib/site";

export const ids = {
  organization: absoluteUrl("/#organization"),
  website: absoluteUrl("/#website"),
  series: absoluteUrl("/#series"),
  person: (id: string) =>
    absoluteUrl(`/hosts/${hosts.find((h) => h.id === id)?.slug ?? id}#person`),
};

export const organization = () => ({
  "@type": "Organization",
  "@id": ids.organization,
  name: site.name,
  url: site.url,
  logo: absoluteUrl("/icon.svg"),
  sameAs: [site.youtubeChannel, site.bobUrl],
});

export const people = () =>
  hosts.map((h) => ({
    "@type": "Person",
    "@id": ids.person(h.id),
    name: h.name,
    jobTitle: h.role,
    url: absoluteUrl(`/hosts/${h.slug}`),
    image: `https://github.com/${h.github}.png`,
    description: h.bio,
    ...(h.sameAs.length ? { sameAs: h.sameAs } : {}),
  }));

export const series = () => ({
  "@type": "CreativeWorkSeries",
  "@id": ids.series,
  name: site.name,
  description: site.description,
  url: site.url,
  inLanguage: "en",
  publisher: { "@id": ids.organization },
  actor: hosts.map((h) => ({ "@id": ids.person(h.id) })),
  about: { "@type": "SoftwareApplication", name: "IBM Bob", url: site.bobUrl },
});

export const website = () => ({
  "@type": "WebSite",
  "@id": ids.website,
  name: site.name,
  url: site.url,
  description: site.description,
  publisher: { "@id": ids.organization },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: absoluteUrl("/search?q={search_term_string}"),
    },
    "query-input": "required name=search_term_string",
  },
});

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});

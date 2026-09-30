/** Per-page on-page SEO checks. Each returns a list of human-readable problems. */
export type PageCheck = (html: string, path: string) => string[];

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const meta = (html: string, name: string) =>
  decode(
    html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1] ??
      "",
  );

export const title: PageCheck = (html, path) => {
  const t = decode(html.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
  if (!t) return ["missing <title>"];
  // Question pages keep the full question (exact-match intent), so allow up to 80.
  const max = path.startsWith("/ask/") ? 80 : 65;
  return t.length > max ? [`title ${t.length} chars (>${max}): ${t}`] : [];
};

export const description: PageCheck = (html) => {
  const d = meta(html, "description");
  if (!d) return ["missing meta description"];
  return d.length < 70 || d.length > 165
    ? [`description ${d.length} chars (want 70-165)`]
    : [];
};

export const headings: PageCheck = (html) => {
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  return h1 === 1 ? [] : [`${h1} <h1> elements (want 1)`];
};

export const canonical: PageCheck = (html, path) => {
  const c = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!c) return ["missing canonical"];
  return new URL(c).pathname.replace(/\/$/, "") === path.replace(/\/$/, "")
    ? []
    : [`canonical mismatch: ${c}`];
};

export const social: PageCheck = (html) =>
  ["og:title", "og:description", "og:image", "twitter:card"]
    .filter((m) => !meta(html, m))
    .map((m) => `missing ${m}`);

export const jsonLd: PageCheck = (html) => {
  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ];
  if (!blocks.length) return ["no JSON-LD"];
  return blocks.flatMap(([, json]) => {
    try {
      JSON.parse(json);
      return [];
    } catch {
      return ["invalid JSON-LD"];
    }
  });
};

export const images: PageCheck = (html) =>
  [...html.matchAll(/<img\b[^>]*>/g)]
    .filter(([tag]) => !/\balt=/.test(tag))
    .map(() => "img without alt");

export const all: PageCheck[] = [
  title,
  description,
  headings,
  canonical,
  social,
  jsonLd,
  images,
];

export const internalLinks = (html: string) =>
  [...html.matchAll(/href="(\/[^"#?]*)/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith("/_next"));

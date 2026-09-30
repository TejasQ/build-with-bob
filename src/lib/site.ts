export const site = {
  name: "Building with Bob",
  shortName: "BwB",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://build-with-bob.vercel.app").replace(
    /\/$/,
    "",
  ),
  tagline: "Live builds with IBM Bob, the AI coding partner",
  description:
    "Watch Tejas Kumar and David Jones-Gilardi build real, open-source apps live with IBM Bob, IBM's AI coding agent. Every episode, write-up and transcript.",
  youtubeChannel: "https://www.youtube.com/@ibm-bob",
  streamsUrl: "https://www.youtube.com/@ibm-bob/streams",
  bobUrl: "https://bob.ibm.com/",
  locale: "en_US",
} as const;

export type Host = {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  github: string;
  sameAs: string[];
};

export const hosts: Host[] = [
  {
    id: "tejas",
    slug: "tejas-kumar",
    name: "Tejas Kumar",
    role: "Host",
    bio: "Developer, author and speaker who builds in public with AI coding agents. Creator of KillrCtx.",
    github: "TejasQ",
    sameAs: [
      "https://tej.as",
      "https://github.com/tejasq",
      "https://linkedin.com/in/tejasq",
    ],
  },
  {
    id: "david",
    slug: "david-jones-gilardi",
    name: "David Jones-Gilardi",
    role: "Co-host",
    bio: "Developer advocate who pairs with Tejas on every build. Creator of Walfly.",
    github: "SonicDMG",
    sameAs: ["https://github.com/sonicdmg", "https://davidgilardi.dev"],
  },
];

export const absoluteUrl = (path = "/") =>
  `${site.url}${path.startsWith("/") ? path : `/${path}`}`;

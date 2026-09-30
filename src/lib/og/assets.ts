import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFile(join(root, path));

/** Fonts are read once at module scope (Satori supports ttf/otf/woff, not woff2). */
const [regular, semibold, bold, mono] = await Promise.all([
  read("assets/fonts/PlexSans-Regular.ttf"),
  read("assets/fonts/PlexSans-SemiBold.ttf"),
  read("assets/fonts/PlexSans-Bold.ttf"),
  read("assets/fonts/PlexMono-Medium.ttf"),
]);

export const fonts = [
  { name: "Plex", data: regular, weight: 400 as const, style: "normal" as const },
  { name: "Plex", data: semibold, weight: 600 as const, style: "normal" as const },
  { name: "Plex", data: bold, weight: 700 as const, style: "normal" as const },
  { name: "PlexMono", data: mono, weight: 500 as const, style: "normal" as const },
];

const avatars: Record<string, string> = Object.fromEntries(
  await Promise.all(
    ["TejasQ", "SonicDMG"].map(async (handle) => [
      handle,
      `data:image/jpeg;base64,${(await read(`assets/og/${handle}.jpg`)).toString("base64")}`,
    ]),
  ),
);

export const avatar = (github: string) => avatars[github];

/** IBM Bob mascot (first frame of bob.ibm.com's wave animation). */
export const bobMascot = `data:image/svg+xml;base64,${(await read("assets/og/bob.svg")).toString("base64")}`;

const remote = new Map<string, Promise<string | null>>();

/** Fetch a remote image once and inline it as a data URI (null if unavailable). */
export function remoteImage(url: string): Promise<string | null> {
  if (!remote.has(url)) {
    remote.set(
      url,
      fetch(url)
        .then(async (r) => {
          if (!r.ok) return null;
          const type = r.headers.get("content-type") ?? "image/jpeg";
          return `data:${type};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
        })
        .catch(() => null),
    );
  }
  return remote.get(url)!;
}

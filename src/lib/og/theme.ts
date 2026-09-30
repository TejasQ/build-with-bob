/** IBM Bob palette for social cards (Satori needs hex colors and inline styles). */
export const og = {
  width: 1200,
  height: 630,
  pad: 64,
  bg: "#0f1116",
  bg2: "#171d2c",
  card: "#1b2233",
  border: "#2a3047",
  text: "#ffffff",
  muted: "#9fa8c1",
  faint: "#687492",
  blue: "#0f62fe",
  blueLight: "#7aabff",
  purple: "#a56eff",
  purpleLight: "#be95ff",
  gradient: "linear-gradient(107deg, #0f62fe 20%, #a56eff 90%)",
} as const;

/** Pick a font size so long titles still fit: [[maxChars, size], …] ascending. */
export function fit(text: string, steps: [number, number][], fallback: number) {
  return steps.find(([max]) => text.length <= max)?.[1] ?? fallback;
}

/** Satori has no text-overflow: ellipsis, so clamp by characters at a word boundary. */
export function clamp(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 12)).replace(/[\s,.;:–-]+$/, "")}…`;
}

export const upper = (text: string) => text.toUpperCase();

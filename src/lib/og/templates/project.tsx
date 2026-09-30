import { Frame } from "../frame";
import { Chips } from "../parts";
import { clamp, og } from "../theme";

type Props = {
  name: string;
  tagline: string;
  stack: string[];
  status: string;
  repo?: string;
  episodes: number;
};

export function ProjectCard({ name, tagline, stack, status, repo, episodes }: Props) {
  const footer = repo ? (
    <div
      style={{ display: "flex", fontFamily: "PlexMono", fontSize: 22, color: og.muted }}
    >
      {repo.replace("https://", "")}
    </div>
  ) : undefined;
  return (
    <Frame kind="Open-source project" footer={footer}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 1072 }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            color: og.muted,
          }}
        >
          {`${status} · built live in ${episodes} episodes`.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 128,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1,
            alignSelf: "flex-start",
            paddingBottom: 8,
            backgroundImage: og.gradient,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {name}
        </div>
        <div
          style={{ display: "flex", fontSize: 32, lineHeight: 1.35, color: "#dce2ef" }}
        >
          {clamp(tagline, 120)}
        </div>
        <Chips items={stack} max={6} />
      </div>
    </Frame>
  );
}

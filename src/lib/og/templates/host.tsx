import { Frame } from "../frame";
import { Avatar } from "../parts";
import { clamp, og } from "../theme";

type Props = { name: string; role: string; bio: string; github: string; links: string[] };

export function HostCard({ name, role, bio, github, links }: Props) {
  return (
    <Frame kind={role} footer={<div style={{ display: "flex" }} />}>
      <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
        <Avatar github={github} size={260} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 700 }}>
          <div
            style={{ display: "flex", fontSize: 76, fontWeight: 700, letterSpacing: -2 }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 600,
              alignSelf: "flex-start",
              backgroundImage: og.gradient,
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {`${role} of Building with Bob`}
          </div>
          <div
            style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: og.muted }}
          >
            {clamp(bio, 130)}
          </div>
          <div
            style={{
              display: "flex",
              gap: 22,
              fontFamily: "PlexMono",
              fontSize: 20,
              color: og.faint,
            }}
          >
            {links.slice(0, 3).map((l) => (
              <div key={l} style={{ display: "flex" }}>
                {l.replace(/^https?:\/\/(www\.)?/, "")}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

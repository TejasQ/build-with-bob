import type { ReactNode } from "react";
import { Hosts, Logo, Pill } from "./parts";
import { og } from "./theme";

type Props = { kind: string; children: ReactNode; footer?: ReactNode };

/** Shared 1200×630 canvas: Bob gradient night sky, faint grid, brand header, hosts footer. */
export function Frame({ kind, children, footer }: Props) {
  return (
    <div
      style={{
        width: og.width,
        height: og.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: og.pad,
        fontFamily: "Plex",
        color: og.text,
        backgroundColor: og.bg,
        backgroundImage: [
          "radial-gradient(circle at 88% 8%, #a56eff55 0%, #a56eff00 38%)",
          "radial-gradient(circle at 8% 100%, #0f62fe44 0%, #0f62fe00 42%)",
          `linear-gradient(180deg, ${og.bg} 0%, ${og.bg2} 100%)`,
        ].join(", "),
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Logo />
          <div style={{ display: "flex", fontSize: 28, fontWeight: 600 }}>
            Building with Bob
          </div>
        </div>
        <Pill>{kind.toUpperCase()}</Pill>
      </div>
      <div style={{ display: "flex", flex: 1, alignItems: "center" }}>{children}</div>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        {footer ?? <Hosts />}
        <div
          style={{
            display: "flex",
            fontFamily: "PlexMono",
            fontSize: 20,
            color: og.faint,
          }}
        >
          build-with-bob.vercel.app
        </div>
      </div>
    </div>
  );
}

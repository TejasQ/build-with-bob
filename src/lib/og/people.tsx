import { avatar } from "./assets";
import { og } from "./theme";

export function Avatar({ github, size = 56 }: { github: string; size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        padding: 3,
        borderRadius: 999,
        backgroundImage: og.gradient,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> */}
      <img
        src={avatar(github)}
        width={size}
        height={size}
        style={{ borderRadius: 999 }}
        alt=""
      />
    </div>
  );
}

export function Hosts() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex" }}>
        <Avatar github="TejasQ" size={44} />
        <div style={{ display: "flex", marginLeft: -12 }}>
          <Avatar github="SonicDMG" size={44} />
        </div>
      </div>
      <div style={{ display: "flex", color: og.muted, fontSize: 20 }}>
        Tejas Kumar &amp; David Jones-Gilardi
      </div>
    </div>
  );
}

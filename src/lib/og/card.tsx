import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

type Props = { eyebrow: string; title: string; footer?: string };

/** Branded 1200×630 social card in the IBM Bob palette. */
export function ogCard({ eyebrow, title, footer = site.tagline }: Props) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "#fff",
        background:
          "radial-gradient(60% 80% at 85% 10%, #a56eff55 0%, #0f111600 60%), linear-gradient(180deg, #0f1116 0%, #171d2c 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "linear-gradient(107deg, #0f62fe 25%, #a56eff 87%)",
          }}
        />
        <span style={{ fontWeight: 600 }}>{site.name}</span>
        <span style={{ color: "#9fa8c1" }}>· {eyebrow}</span>
      </div>
      <div
        style={{
          fontSize: title.length > 60 ? 60 : 72,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#bec6da" }}>{footer}</div>
    </div>,
    ogSize,
  );
}

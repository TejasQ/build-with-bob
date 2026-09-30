import { clamp, fit, og } from "./theme";

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  maxWidth?: number;
  big?: boolean;
  /** Narrow column (e.g. next to a thumbnail): smaller steps, tighter gaps. */
  compact?: boolean;
};

type Steps = [number, number][];
const BIG: Steps = [[24, 92], [40, 80], [60, 68]]; // prettier-ignore
const NORMAL: Steps = [[30, 72], [50, 62], [70, 54], [90, 48]]; // prettier-ignore
const COMPACT: Steps = [[30, 56], [50, 48], [70, 42]]; // prettier-ignore

/** Eyebrow (gradient caps), auto-sized title, muted subtitle: the core of every card. */
export function Headline({
  eyebrow,
  title,
  subtitle,
  maxWidth = 1072,
  big,
  compact,
}: Props) {
  const t = clamp(title, 110);
  const size = big ? fit(t, BIG, 58) : compact ? fit(t, COMPACT, 38) : fit(t, NORMAL, 42);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: compact ? 14 : 22,
        maxWidth,
      }}
    >
      {eyebrow && (
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            backgroundImage: og.gradient,
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {eyebrow.toUpperCase()}
        </div>
      )}
      <div
        style={{
          display: "flex",
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          textWrap: "balance",
        }}
      >
        {t}
      </div>
      {subtitle && (
        <div style={{ display: "flex", fontSize: 26, lineHeight: 1.4, color: og.muted }}>
          {clamp(subtitle, 150)}
        </div>
      )}
    </div>
  );
}

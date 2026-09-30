import { og } from "./theme";

export { Logo, Play } from "./icons";
export { Avatar, Hosts } from "./people";

export function Pill({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: 2,
        borderRadius: 999,
        backgroundImage: og.gradient,
      }}
    >
      <div
        style={{
          display: "flex",
          padding: "8px 20px",
          borderRadius: 999,
          backgroundColor: og.bg,
          color: og.text,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "8px 18px",
        borderRadius: 999,
        border: `1px solid ${og.border}`,
        backgroundColor: "#1f2942",
        color: "#dce2ef",
        fontSize: 20,
      }}
    >
      {children}
    </div>
  );
}

export function Chips({ items, max = 4 }: { items: string[]; max?: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      {items.slice(0, max).map((item) => (
        <Chip key={item}>{item}</Chip>
      ))}
    </div>
  );
}

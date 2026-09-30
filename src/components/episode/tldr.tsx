/** Answer-first summary block; first thing crawlers and answer engines read. */
export function Tldr({ text, label = "TL;DR" }: { text: string; label?: string }) {
  return (
    <div className="rounded-2xl border border-border p-6 bg-bob-feature">
      <p className="mb-2 text-xs font-semibold tracking-widest text-accent-fg uppercase">
        {label}
      </p>
      <p className="text-lg leading-relaxed font-light" data-speakable="summary">
        {text}
      </p>
    </div>
  );
}

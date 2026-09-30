type Props = { id: string; eyebrow?: string; title: string; children?: React.ReactNode };

export function SectionHeading({ id, eyebrow, title, children }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-2">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-widest text-accent-fg uppercase">
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="text-2xl font-semibold tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

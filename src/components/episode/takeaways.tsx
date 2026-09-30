export function Takeaways({ items }: { items: string[] }) {
  return (
    <section
      aria-labelledby="takeaways"
      className="rounded-2xl border border-border p-6 bg-bob-card"
    >
      <h2 id="takeaways" className="mb-4 text-xl font-semibold">
        Key takeaways
      </h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 font-light">
            <span
              className="mt-2 size-2 shrink-0 rounded-full bg-bob-gradient"
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { Guide } from "@/lib/content/schema";
import { GuideCard } from "./guide-card";

export function GuideGrid({ guides }: { guides: Guide[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((g) => (
        <li key={g.slug}>
          <GuideCard guide={g} />
        </li>
      ))}
    </ul>
  );
}

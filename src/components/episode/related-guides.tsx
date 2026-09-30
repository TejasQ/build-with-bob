import { GuideGrid } from "@/components/guide/guide-grid";
import { SectionHeading } from "@/components/section-heading";
import type { Guide } from "@/lib/content/schema";

export function RelatedGuides({ guides }: { guides: Guide[] }) {
  if (!guides.length) return null;
  return (
    <section aria-labelledby="related-guides">
      <SectionHeading
        id="related-guides"
        eyebrow="Go deeper"
        title="Guides that use this episode"
      />
      <GuideGrid guides={guides} />
    </section>
  );
}

import { ogContentType, ogSize, renderOg } from "@/lib/og/render";
import { HostCard } from "@/lib/og/templates/host";
import { hosts } from "@/lib/site";

export const size = ogSize;
export const contentType = ogContentType;
export const alt = "Building with Bob host";

export const generateStaticParams = () => hosts.map((h) => ({ slug: h.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = hosts.find((x) => x.slug === slug)!;
  return renderOg(
    HostCard({
      name: h.name,
      role: h.role,
      bio: h.bio,
      github: h.github,
      links: h.sameAs,
    }),
  );
}

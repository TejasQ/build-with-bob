import { ButtonLink } from "@/components/button-link";
import type { Episode } from "@/lib/content/schema";
import { site } from "@/lib/site";

export function Hero({ latest }: { latest: Episode }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#a56eff33,transparent)] blur-2xl"
      />
      <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-16 text-center">
        <p className="mx-auto mb-6 w-fit rounded-full px-4 py-1 text-xs font-medium border-bob-gradient">
          Streamed live on YouTube · Open source
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          <span className="text-bob-gradient">{site.name}</span>
          <span className="block">Real apps, built live with IBM Bob</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-light text-muted-foreground">
          {site.description}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={latest.url}>Watch episode {latest.number}</ButtonLink>
          <ButtonLink href="/search" variant="outline">
            Search every transcript
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

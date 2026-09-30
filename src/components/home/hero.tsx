import { ButtonLink } from "@/components/button-link";
import type { Episode } from "@/lib/content/schema";
import { site } from "@/lib/site";
import { BobWave } from "./bob-wave";

export function Hero({ latest }: { latest: Episode }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#a56eff33,transparent)] blur-2xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 pt-12 pb-16 lg:grid-cols-[1fr_26rem] lg:pt-20">
        <div className="relative order-first mx-auto w-48 sm:w-60 lg:order-last lg:w-full">
          <div
            aria-hidden="true"
            className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,#0f62fe55,transparent)] blur-2xl"
          />
          <BobWave className="relative" />
        </div>
        <div className="text-center lg:text-left">
          <p className="mx-auto mb-6 w-fit rounded-full px-4 py-1 text-xs font-medium border-bob-gradient lg:mx-0">
            Streamed live on YouTube · Open source
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            <span className="text-bob-gradient">{site.name}</span>
            <span className="block">Real apps, built live with IBM Bob</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-light text-muted-foreground lg:mx-0">
            {site.description}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <ButtonLink href={latest.url}>Watch episode {latest.number}</ButtonLink>
            <ButtonLink href="/search" variant="outline">
              Search every transcript
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

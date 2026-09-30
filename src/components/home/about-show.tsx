import { Faq } from "@/components/episode/faq";
import { showFaq } from "@/lib/content/show-faq";

/** Answer-first definitions of the show; the passage answer engines quote. */
export function AboutShow() {
  return (
    <section
      aria-labelledby="what-is"
      className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2"
    >
      <div className="space-y-4">
        <h2 id="what-is" className="text-2xl font-semibold tracking-tight md:text-3xl">
          What is Building with Bob?
        </h2>
        <p className="text-lg leading-relaxed font-light">
          <strong className="font-semibold">Building with Bob</strong> is a livestream in
          which Tejas Kumar and David Jones-Gilardi build real, open-source software from
          scratch with IBM Bob, IBM&apos;s AI coding agent. Every episode is unscripted:
          planning, debugging, code review and the mistakes stay in.
        </p>
        <p className="leading-relaxed font-light text-muted-foreground">
          Each episode gets a written breakdown with key takeaways, timestamped chapters,
          an FAQ and the full transcript, so you can find the exact moment a problem was
          solved.
        </p>
      </div>
      <Faq items={showFaq} heading="Show FAQ" />
    </section>
  );
}

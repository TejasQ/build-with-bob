"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/**
 * IBM Bob's waving mascot (the Lottie from bob.ibm.com). A static first frame renders
 * immediately; the light SVG player loads after hydration, waves once, and waves again on
 * hover or tap. Respects prefers-reduced-motion.
 */
export function BobWave({ className = "" }: { className?: string }) {
  const container = useRef<HTMLButtonElement>(null);
  const anim = useRef<AnimationItem | null>(null);

  useEffect(() => {
    const el = container.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled) return;
      el.querySelector("img")?.remove();
      anim.current = lottie.loadAnimation({
        container: el,
        renderer: "svg",
        loop: false,
        autoplay: true,
        path: "/bob-wave.json",
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
    });
    return () => {
      cancelled = true;
      anim.current?.destroy();
    };
  }, []);

  const wave = () => anim.current?.goToAndPlay(0, true);

  return (
    <button
      ref={container}
      type="button"
      onClick={wave}
      onMouseEnter={wave}
      aria-label="Bob waving animation"
      className={`relative block aspect-square cursor-pointer [&>svg]:size-full ${className}`}
    >
      {/* Static first frame: instant paint, no layout shift, works without JS. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG asset, no optimization needed */}
      <img
        src="/bob.svg"
        alt=""
        width={512}
        height={512}
        className="size-full"
        fetchPriority="high"
      />
    </button>
  );
}

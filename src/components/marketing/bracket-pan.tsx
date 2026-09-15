"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import { BracketView } from "@/components/app/bracket-view";
import type { BracketMatchView } from "@/lib/domain/repo";

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------------------------
   Layout family: horizontal scroll hijack.

   Why this animation exists: a bracket is read left to right, but it is wider
   than any phone. Pinning the section and converting vertical scroll into
   horizontal travel lets the reader walk the draw from first round to final in
   the direction the data actually runs. That is the justification; it is not
   motion for its own sake.

   Follows the canonical skeleton: start "top top", pin the wrapper, scrub the
   inner track, invalidateOnRefresh so it survives a resize, and revert the
   context on unmount so no trigger leaks between routes.
   -------------------------------------------------------------------------- */

export function BracketPan({
  rounds,
  tournamentName,
  drawName,
}: {
  rounds: BracketMatchView[][];
  tournamentName: string;
  drawName: string;
}) {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;

    // Below the pin breakpoint the track is a plain swipeable rail instead.
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;

    const ctx = gsap.context(() => {
      const distance = () =>
        Math.max(0, track.current!.scrollWidth - window.innerWidth + 96);

      if (distance() <= 0) return;

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      ref={wrap}
      className="rule-t relative overflow-hidden py-16 md:py-0"
    >
      <div className="md:flex md:min-h-[100dvh] md:flex-col md:justify-center">
        <div className="shell">
          <h2 className="max-w-[20ch] font-display text-[clamp(2rem,5.5vw,4rem)] leading-[0.9]">
            Las llaves, en directo
          </h2>
          <p className="mt-4 max-w-[54ch] text-sm leading-relaxed text-paper/65">
            {tournamentName}
            <span className="mx-1.5 text-paper/30">/</span>
            {drawName}. El club carga los resultados y el cuadro avanza solo.
          </p>
        </div>

        {/* Desktop: pinned and scrubbed. Mobile: a normal swipe rail. */}
        <div className="mt-10 overflow-x-auto md:overflow-visible">
          <div
            ref={track}
            className="shell flex w-max items-stretch gap-4 pb-4 md:pb-0"
          >
            <BracketView rounds={rounds} />
          </div>
        </div>
      </div>
    </section>
  );
}

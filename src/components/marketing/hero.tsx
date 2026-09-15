"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";

/**
 * The WebGL scene is client-only and code-split: it must never block the
 * headline, which is the LCP element. Until it resolves the hero renders on the
 * cobalt field alone and looks deliberate rather than unfinished.
 */
const CourtScene = dynamic(() => import("@/components/three/court-scene"), {
  ssr: false,
});

export function Hero() {
  // Honoured by the scene itself: reduced motion renders one still frame.
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-16 pb-20 md:pt-24">
      {/* Scene sits behind the type and never intercepts pointer events. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <CourtScene still={Boolean(reduce)} />
        {/* Scrim: keeps the headline above WCAG AAA over a moving background. */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,var(--color-cobalt-900)_0%,var(--color-cobalt-900)_34%,color-mix(in_oklab,var(--color-cobalt-900)_55%,transparent)_56%,transparent_78%)]" />
      </div>

      <div className="shell grid w-full gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 xl:col-span-7">
          {/* Two short lines by design: at this scale anything longer wraps
              to a third line and the tight leading makes them collide. */}
          <h1
            className="rise font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95]"
            style={{ ["--i" as string]: 0 }}
          >
            Te falta uno.
            <br />
            <span className="text-volt">Aquí está.</span>
          </h1>

          <p
            className="rise mt-7 max-w-[46ch] text-base leading-relaxed text-paper/75 md:text-lg"
            style={{ ["--i" as string]: 1 }}
          >
            Publica tu partido, entra en el de otro y compite en los torneos
            de tu club.
          </p>

          <div
            className="rise mt-9 flex flex-wrap items-center gap-3"
            style={{ ["--i" as string]: 2 }}
          >
            <ButtonLink href="/partidos" size="lg">
              Buscar partido
              <ArrowRight size={18} weight="bold" />
            </ButtonLink>
            <ButtonLink href="/partidos/publicar" size="lg" variant="secondary">
              Publicar partido
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

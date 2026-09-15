import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { HeroScene } from "./hero-scene";
import { BRAND, HERO_CUTOUT, imageUrl } from "@/data/images";
import { hasAsset } from "@/lib/assets";

/* ----------------------------------------------------------------------------
   Hero.

   Two compositions, picked on the server by what is actually on disk:

     with the court photograph  the photo is the field, and the WebGL layer
                                drops its wireframe court (the photo already has
                                one) keeping only the drifting balls, so the
                                hero still moves without two courts fighting.

     without it                 the WebGL court carries the whole frame, cage
                                included.

   Either way the headline is the LCP element and never waits on the canvas.
   -------------------------------------------------------------------------- */

export function Hero() {
  const hasCourt = hasAsset(BRAND.courtNight);
  const hasCutout = hasAsset(HERO_CUTOUT);

  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-16 pb-20 md:pt-24">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {hasCourt && (
          <Image
            src={imageUrl(BRAND.courtNight)}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        )}

        {/* The cage is redundant over a photograph of a real court. */}
        <HeroScene showCage={!hasCourt} />

        <div
          className={
            hasCourt
              ? "absolute inset-0 bg-[linear-gradient(100deg,var(--color-cobalt-950)_0%,color-mix(in_oklab,var(--color-cobalt-950)_88%,transparent)_38%,color-mix(in_oklab,var(--color-cobalt-900)_55%,transparent)_62%,transparent_86%)]"
              : "absolute inset-0 bg-[linear-gradient(100deg,var(--color-cobalt-900)_0%,var(--color-cobalt-900)_34%,color-mix(in_oklab,var(--color-cobalt-900)_55%,transparent)_56%,transparent_78%)]"
          }
        />
      </div>

      {/* Optional cut-out player, anchored to the right edge on wide screens. */}
      {hasCutout && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] lg:block"
          aria-hidden="true"
        >
          <Image
            src={imageUrl(HERO_CUTOUT)}
            alt=""
            fill
            sizes="42vw"
            className="object-contain object-bottom"
          />
        </div>
      )}

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

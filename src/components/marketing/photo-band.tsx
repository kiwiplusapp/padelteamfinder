import Image from "next/image";
import { BRAND, imageUrl } from "@/data/images";
import { hasAsset } from "@/lib/assets";
import { Reveal } from "@/components/ui/reveal";

/* ----------------------------------------------------------------------------
   Layout family: full-bleed photographic band.

   The paddle-touch frame is the product in one picture: two people who did not
   arrive together, meeting at the net. It earns a full band rather than a
   thumbnail, and the copy stays to one line so the photograph carries it.

   The section returns null when the photography is not on disk, so the page
   closes the gap instead of showing an empty frame.
   -------------------------------------------------------------------------- */

export function PhotoBand() {
  const hasPaddle = hasAsset(BRAND.paddleTouch);
  const hasPlayer = hasAsset(BRAND.playerCelebration);

  if (!hasPaddle && !hasPlayer) return null;

  return (
    <section className="rule-t py-16 md:py-24">
      <div className="shell">
        <Reveal>
          <div className="grid gap-4 md:grid-cols-12">
            {hasPaddle && (
              <figure
                className={`relative overflow-hidden ${
                  hasPlayer ? "md:col-span-8" : "md:col-span-12"
                } aspect-[16/10] md:aspect-[16/9]`}
              >
                <Image
                  src={imageUrl(BRAND.paddleTouch)}
                  alt="Dos jugadores chocan las palas por encima de la red antes de empezar"
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950/85 via-cobalt-950/20 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <p className="max-w-[20ch] font-display text-[clamp(1.5rem,3vw,2.75rem)] leading-[0.95]">
                    Llegasteis por separado. Salís como pareja.
                  </p>
                </figcaption>
              </figure>
            )}

            {hasPlayer && (
              <figure
                className={`relative overflow-hidden ${
                  hasPaddle ? "md:col-span-4" : "md:col-span-12"
                } aspect-[4/3] md:aspect-auto`}
              >
                <Image
                  src={imageUrl(BRAND.playerCelebration)}
                  alt="Un jugador celebra un punto durante un torneo"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950/80 to-transparent" />
              </figure>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

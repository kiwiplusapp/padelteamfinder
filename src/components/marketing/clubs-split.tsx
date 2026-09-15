import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { CLUB_COVERS, photo } from "@/data/images";
import { listClubs } from "@/lib/domain/repo";

/* ----------------------------------------------------------------------------
   Layout family: split screen.

   Left column carries one photograph at full bleed, right column carries the
   real club list. The split exists because the photo and the list are two
   different kinds of information, not to fill a row.
   -------------------------------------------------------------------------- */

export function ClubsSplit() {
  const { items, total } = listClubs({ limit: 5 });
  if (!items.length) return null;

  const feature = items[0];

  return (
    <section className="rule-t py-16 md:py-24">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden border border-[var(--line)]">
              <Photo
                slot={CLUB_COVERS[feature.id] ?? photo(feature.slug, 1200, 1500)}
                alt={`Pistas de ${feature.name}`}
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-[clamp(2rem,5.5vw,4rem)] leading-[0.9]">
              Clubes con pista libre cerca de ti
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-paper/65">
              Filtra por ciudad y por distancia. Los clubes afiliados aceptan la
              inscripción aquí mismo. El resto aparece igual, con su enlace.
            </p>
          </Reveal>

          <RevealGroup className="mt-10 flex flex-col">
            {items.map((club) => (
              <RevealItem key={club.id}>
                <Link
                  href={`/clubes/${club.slug}`}
                  className="rule-t group flex items-center justify-between gap-4 py-4 transition-colors hover:text-volt"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-display text-lg leading-none">
                        {club.name}
                      </h3>
                      {club.affiliated && <Badge tone="accent">Afiliado</Badge>}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-paper/55">
                      <MapPin size={13} weight="bold" />
                      {club.location.neighbourhood
                        ? `${club.location.neighbourhood}, ${club.location.city}`
                        : club.location.city}
                    </p>
                  </div>

                  <p className="nums shrink-0 text-right text-[13px] text-paper/55">
                    {club.courts.length} pistas
                    {club.openMatches > 0 && (
                      <span className="block font-semibold text-volt">
                        {club.openMatches} abiertos
                      </span>
                    )}
                  </p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>

          <Link
            href="/clubes"
            className="rule-t mt-2 block py-4 text-sm font-semibold text-paper/80 transition-colors hover:text-volt"
          >
            Ver los {total} clubes
          </Link>
        </div>
      </div>
    </section>
  );
}

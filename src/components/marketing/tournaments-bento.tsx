import Link from "next/link";
import { ArrowUpRight, Trophy } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { TOURNAMENT_COVERS, photo } from "@/data/images";
import { listTournaments, platformTotals } from "@/lib/domain/repo";
import { CATEGORY_LABEL } from "@/lib/domain/schemas";
import { formatDate, formatMoney } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Layout family: bento.

   Four real tournaments plus one derived figure. Five items, five cells, no
   blank tile. Three of the five carry photography and one carries the accent
   fill, so the grid is not a wall of text cards.
   -------------------------------------------------------------------------- */

export function TournamentsBento() {
  const { items } = listTournaments({ limit: 4 });
  const totals = platformTotals();

  if (items.length === 0) return null;

  const [lead, ...rest] = items;

  return (
    <section className="rule-t py-16 md:py-24">
      <div className="shell">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-volt">
            Torneos
          </p>
          <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(2rem,5.5vw,4rem)] leading-[0.9]">
            Compite donde ya juegas
          </h2>
        </Reveal>

        <div className="mt-12 grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
          {/* Cell 1: the lead event, two columns and two rows. */}
          <Link
            href={`/torneos/${lead.slug}`}
            className="group relative isolate col-span-1 row-span-1 flex min-h-[320px] flex-col justify-end overflow-hidden border border-[var(--line)] p-6 md:col-span-2 md:row-span-2 md:min-h-full"
          >
            <div className="absolute inset-0 -z-10">
              <Photo
                slot={TOURNAMENT_COVERS[lead.slug] ?? photo(lead.slug, 1400, 900)}
                alt=""
                sizes="(min-width: 768px) 66vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950 via-cobalt-950/65 to-cobalt-950/10" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {lead.categories.slice(0, 3).map((c) => (
                <Badge key={c} tone="neutral">
                  {CATEGORY_LABEL[c]}
                </Badge>
              ))}
            </div>

            <h3 className="mt-4 max-w-[16ch] font-display text-[clamp(1.75rem,3.5vw,3rem)] leading-[0.92]">
              {lead.name}
            </h3>

            <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-paper/75">
              {lead.summary}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-paper/70">
              <span className="nums">{formatDate(lead.startsAt)}</span>
              <span>{lead.club.location.city}</span>
              {lead.totalPrizePool > 0 && (
                <span className="nums font-semibold text-volt">
                  {formatMoney(lead.totalPrizePool, lead.currency)} en premios
                </span>
              )}
            </div>
          </Link>

          {/* Cells 2 and 3: supporting events with photography. */}
          {rest.slice(0, 2).map((t) => (
            <Link
              key={t.id}
              href={`/torneos/${t.slug}`}
              className="group relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden border border-[var(--line)] p-5"
            >
              <div className="absolute inset-0 -z-10">
                <Photo
                  slot={TOURNAMENT_COVERS[t.slug] ?? photo(t.slug, 1400, 900)}
                  alt=""
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950 via-cobalt-950/70 to-cobalt-950/20" />
              </div>

              <h3 className="font-display text-xl leading-tight">{t.name}</h3>
              <p className="nums mt-1.5 text-[13px] text-paper/65">
                {formatDate(t.startsAt)}
                <span className="mx-1.5 text-paper/30">/</span>
                {t.club.location.city}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-volt">
                {t.totalSpotsLeft > 0
                  ? `Quedan ${t.totalSpotsLeft} plazas`
                  : "Cuadro completo"}
              </p>
            </Link>
          ))}

          {/* Cell 4: the accent fill. Derived figure, not a decorative tile. */}
          <div className="flex flex-col justify-between border border-volt bg-volt p-5 text-ink">
            <Trophy size={26} weight="fill" />
            <div>
              <p className="nums font-display text-[clamp(2rem,4vw,3rem)] leading-none">
                {formatMoney(totals.prizePool, "EUR")}
              </p>
              <p className="mt-2 max-w-[24ch] text-[13px] font-medium leading-snug text-ink/75">
                repartidos en los torneos abiertos ahora mismo.
              </p>
            </div>
          </div>

          {/* Cell 5: the route out of the section. */}
          <Link
            href="/torneos"
            className="group flex flex-col justify-between border border-[var(--line)] bg-cobalt-850/40 p-5 transition-colors hover:border-volt/50"
          >
            <ArrowUpRight
              size={26}
              weight="bold"
              className="text-paper/50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-volt"
            />
            <div>
              <p className="font-display text-2xl leading-tight">
                Todos los torneos
              </p>
              <p className="mt-2 text-[13px] leading-snug text-paper/60">
                Filtra por ciudad, categoría y fecha.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

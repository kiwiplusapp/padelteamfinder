import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { MatchCard } from "@/components/app/match-card";
import { EmptyState } from "@/components/ui/states";
import { listMatches, platformTotals } from "@/lib/domain/repo";

/* ----------------------------------------------------------------------------
   Layout family: horizontal rail.

   This is the proof section. Rather than describing the product it shows the
   actual open matches in the database right now, which is also why the counts
   below are derived rather than written.
   -------------------------------------------------------------------------- */

export function LiveMatches() {
  const { items } = listMatches({ onlyOpen: true, limit: 9 });
  const totals = platformTotals();

  return (
    <section className="rule-t py-16 md:py-24">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92]">
              Partidos abiertos
              <br />
              ahora mismo
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-paper/65">
              <span className="nums font-semibold text-volt">
                {totals.openMatches}
              </span>{" "}
              partidos buscan jugador en {totals.cities} ciudades. Entra en uno
              y ya está.
            </p>
          </div>

          <Link
            href="/partidos"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-paper/80 transition-colors hover:text-volt"
          >
            Ver todos
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="shell mt-10">
          <EmptyState
            title="Ahora mismo no hay partidos abiertos"
            body="Sé quien lo empieza. Publica la hora y la pista, y deja que se apunten."
            actionLabel="Publicar partido"
            actionHref="/partidos/publicar"
          />
        </div>
      ) : (
        /* Full-bleed rail that still starts at the page gutter. */
        <div className="mt-10 overflow-hidden">
          <div className="rail shell pb-2">
            {items.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

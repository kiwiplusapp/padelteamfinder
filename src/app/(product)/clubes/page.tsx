import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { FilterBar, type FilterSpec } from "@/components/app/filter-bar";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/states";
import { CLUB_COVERS, photo } from "@/data/images";
import { listCities, listClubs } from "@/lib/domain/repo";
import { ClubQuery } from "@/lib/domain/schemas";
import { formatDistance } from "@/lib/geo";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Clubes y pistas",
  description:
    "Clubes de pádel con pistas disponibles, ordenados por distancia.",
};

export default async function ClubsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = ClubQuery.safeParse(flat);
  const query = parsed.success ? parsed.data : ClubQuery.parse({});

  const { items, total } = listClubs({ ...query, limit: 48 });
  const nearby = typeof query.lat === "number" && typeof query.lng === "number";

  const filters: FilterSpec[] = [
    {
      key: "city",
      label: "Ciudad",
      options: listCities().map((c) => ({ value: c, label: c })),
    },
    {
      key: "indoor",
      label: "Cubierta",
      options: [{ value: "true", label: "Con pista cubierta" }],
    },
    {
      key: "affiliated",
      label: "Afiliación",
      options: [
        { value: "true", label: "Clubes afiliados" },
        { value: "false", label: "No afiliados" },
      ],
    },
  ];

  return (
    <div className="shell">
      <PageHeader
        title="Clubes y pistas"
        lead="Dónde jugar cerca de ti, con precio por pista y partidos abiertos."
      />

      <FilterBar filters={filters} geo className="rule-t pt-6" />

      <p className="nums mt-6 text-[13px] text-paper/55" aria-live="polite">
        {total} {total === 1 ? "club" : "clubes"}
        {nearby && ` a menos de ${query.radiusKm} km`}
      </p>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8 mb-16"
          title="Ningún club con ese filtro"
          body="Amplía el radio de búsqueda o prueba con otra ciudad."
          actionLabel="Ver todos"
          actionHref="/clubes"
        />
      ) : (
        <ul className="mt-8 mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((club) => (
            <li key={club.id} className="flex">
              <Link
                href={`/clubes/${club.slug}`}
                className="group flex w-full flex-col border border-[var(--line)] bg-cobalt-850/40 transition-colors hover:border-volt/50"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Photo
                    slot={CLUB_COVERS[club.id] ?? photo(club.slug, 1200, 800)}
                    alt=""
                    sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950/80 to-transparent" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {club.affiliated && <Badge tone="accent">Afiliado</Badge>}
                    {club.indoorCourts > 0 && (
                      <Badge tone="neutral">
                        {club.indoorCourts} cubiertas
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display text-xl leading-tight">
                      {club.name}
                    </h2>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-paper/60">
                      <MapPin size={13} weight="bold" />
                      {club.location.neighbourhood
                        ? `${club.location.neighbourhood}, ${club.location.city}`
                        : club.location.city}
                      {club.distanceKm !== null && (
                        <span className="nums text-paper/45">
                          {formatDistance(club.distanceKm)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-[13px]">
                    <span className="nums text-paper/60">
                      {club.courts.length} pistas
                      {club.priceFrom !== null && (
                        <>
                          <span className="mx-1.5 text-paper/30">/</span>
                          desde {formatMoney(club.priceFrom)}
                        </>
                      )}
                    </span>
                    {club.openMatches > 0 && (
                      <span className="font-semibold text-volt">
                        {club.openMatches} abiertos
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

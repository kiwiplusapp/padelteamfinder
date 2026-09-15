import type { Metadata } from "next";
import { FilterBar, type FilterSpec } from "@/components/app/filter-bar";
import { PageHeader } from "@/components/app/page-header";
import { TournamentCard } from "@/components/app/tournament-card";
import { EmptyState } from "@/components/ui/states";
import { listCities, listTournaments } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  GENDER_LABEL,
  TOURNAMENT_STATUS_LABEL,
  TournamentQuery,
} from "@/lib/domain/schemas";

export const metadata: Metadata = {
  title: "Torneos",
  description:
    "Torneos de pádel abiertos a inscripción, por ciudad, categoría y fecha.",
};

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = TournamentQuery.safeParse(flat);
  const query = parsed.success ? parsed.data : TournamentQuery.parse({});

  const { items, total } = listTournaments({ ...query, limit: 48 });

  const filters: FilterSpec[] = [
    {
      key: "city",
      label: "Ciudad",
      options: listCities().map((c) => ({ value: c, label: c })),
    },
    {
      key: "category",
      label: "Categoría",
      options: CATEGORY_ORDER.map((c) => ({
        value: c,
        label: CATEGORY_LABEL[c],
      })),
    },
    {
      key: "gender",
      label: "Género",
      options: Object.entries(GENDER_LABEL).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "status",
      label: "Estado",
      options: (
        ["inscripcion-abierta", "en-juego", "finalizado"] as const
      ).map((s) => ({ value: s, label: TOURNAMENT_STATUS_LABEL[s] })),
    },
  ];

  return (
    <div className="shell">
      <PageHeader
        title="Torneos"
        lead="Cuadros por categoría y género, con premios y plazas reales."
      />

      <FilterBar filters={filters} geo className="rule-t pt-6" />

      <p className="nums mt-6 text-[13px] text-paper/55" aria-live="polite">
        {total} {total === 1 ? "torneo" : "torneos"}
      </p>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8 mb-16"
          title="No hay torneos con ese filtro"
          body="Prueba con otra ciudad o quita la categoría. Los clubes publican cuadros nuevos cada semana."
          actionLabel="Ver todos"
          actionHref="/torneos"
        />
      ) : (
        <ul className="mt-8 mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((tournament) => (
            <li key={tournament.id} className="flex">
              <TournamentCard tournament={tournament} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

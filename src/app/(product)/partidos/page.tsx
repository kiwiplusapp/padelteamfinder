import type { Metadata } from "next";
import { FilterBar, type FilterSpec } from "@/components/app/filter-bar";
import { MatchCard } from "@/components/app/match-card";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { listCities, listMatches } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  GENDER_LABEL,
  MatchQuery,
} from "@/lib/domain/schemas";

export const metadata: Metadata = {
  title: "Partidos abiertos",
  description:
    "Partidos de pádel que buscan jugador, filtrados por ciudad, categoría, nivel y distancia.",
};

/* ----------------------------------------------------------------------------
   Listing.

   A server component: the query lives in the URL, the repository answers it,
   and nothing about the result set is hydrated on the client. Only the filter
   controls are interactive.
   -------------------------------------------------------------------------- */

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;

  // Flatten repeated keys, then let the same schema the API uses validate it.
  const flat = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const parsed = MatchQuery.safeParse(flat);
  const query = parsed.success ? parsed.data : MatchQuery.parse({});

  const { items, total } = listMatches({ ...query, limit: 48 });
  const cities = listCities();
  const nearby = typeof query.lat === "number" && typeof query.lng === "number";

  const filters: FilterSpec[] = [
    {
      key: "city",
      label: "Ciudad",
      options: cities.map((c) => ({ value: c, label: c })),
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
      key: "onlyOpen",
      label: "Disponibilidad",
      options: [{ value: "true", label: "Solo con plazas" }],
    },
  ];

  return (
    <div className="shell">
      <PageHeader
        title="Partidos abiertos"
        lead="Alguien reservó pista y le falta gente. Filtra por tu zona y tu nivel."
        action={
          <ButtonLink href="/partidos/publicar">Publicar partido</ButtonLink>
        }
      />

      <FilterBar filters={filters} geo className="rule-t pt-6" />

      <p className="nums mt-6 text-[13px] text-paper/55" aria-live="polite">
        {total} {total === 1 ? "partido" : "partidos"}
        {nearby && ` a menos de ${query.radiusKm} km`}
      </p>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8 mb-16"
          title="Ningún partido encaja con ese filtro"
          body="Prueba a ampliar el radio o quitar la categoría. Si no hay nada, publica tú el partido y deja que se apunten."
          actionLabel="Publicar partido"
          actionHref="/partidos/publicar"
        />
      ) : (
        <ul className="mt-8 mb-16 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((match) => (
            <li key={match.id} className="flex">
              <MatchCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

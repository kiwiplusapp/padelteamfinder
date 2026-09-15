import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { ClubSwitcher } from "@/components/app/club-switcher";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { getClubConsole, listClubs } from "@/lib/domain/repo";
import {
  MATCH_STATUS_LABEL,
  TOURNAMENT_STATUS_LABEL,
} from "@/lib/domain/schemas";
import { formatDate, formatMoney, formatTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Panel de club",
  description: "Gestiona torneos, cuadros, llaves y plazas libres de tu club.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const requested = Array.isArray(sp.club) ? sp.club[0] : sp.club;

  const { items: clubs } = listClubs({ limit: 50 });
  const clubId = requested ?? clubs[0]?.id;
  const console_ = clubId ? getClubConsole(clubId) : null;

  if (!console_) {
    return (
      <div className="shell">
        <PageHeader title="Panel de club" />
        <EmptyState
          title="No hay ningún club cargado"
          body="Comprueba la semilla de datos o vuelve al inicio."
          actionLabel="Ir al inicio"
          actionHref="/"
        />
      </div>
    );
  }

  const stats = [
    { label: "Pistas", value: String(console_.courts.length) },
    { label: "Torneos", value: String(console_.tournaments.length) },
    { label: "Parejas inscritas", value: String(console_.registeredTeams) },
    {
      label: "Cuotas comprometidas",
      value: formatMoney(console_.revenueCommitted),
    },
  ];

  return (
    <div className="shell">
      <PageHeader
        title={console_.club.name}
        lead="Torneos, cuadros y plazas libres de este club."
        action={
          <ButtonLink href={`/admin/torneos/nuevo?club=${console_.club.id}`}>
            <Plus size={16} weight="bold" />
            Crear torneo
          </ButtonLink>
        }
      />

      <div className="rule-t py-6">
        <ClubSwitcher
          clubs={clubs.map((c) => ({
            id: c.id,
            name: c.name,
            city: c.location.city,
          }))}
          current={console_.club.id}
        />
      </div>

      <dl className="rule-t grid grid-cols-2 gap-x-6 gap-y-6 py-7 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              {stat.label}
            </dt>
            <dd className="nums mt-1.5 font-display text-3xl leading-none">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="rule-t py-8">
        <h2 className="font-display text-2xl leading-none">Torneos</h2>

        {console_.tournaments.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="Todavía no has creado ningún torneo"
            body="Define fechas, abre un cuadro por categoría y fija los premios. Aparecerá en la web y en la API al instante."
            actionLabel="Crear torneo"
            actionHref={`/admin/torneos/nuevo?club=${console_.club.id}`}
          />
        ) : (
          /* A dense operational table rather than cards: this surface is for
             scanning and acting, not for browsing. */
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--line-strong)] text-left">
                  <th scope="col" className="py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Torneo
                  </th>
                  <th scope="col" className="py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Fechas
                  </th>
                  <th scope="col" className="py-2.5 pr-4 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Estado
                  </th>
                  <th scope="col" className="py-2.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Cuadros
                  </th>
                  <th scope="col" className="py-2.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Parejas
                  </th>
                  <th scope="col" className="py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Premios
                  </th>
                </tr>
              </thead>
              <tbody>
                {console_.tournaments.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--line)] last:border-b-0"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/torneos/${t.id}`}
                        className="font-semibold transition-colors hover:text-volt"
                      >
                        {t.name}
                      </Link>
                    </td>
                    <td className="nums py-3 pr-4 text-paper/65">
                      {formatDate(t.startsAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        tone={
                          t.status === "inscripcion-abierta"
                            ? "accent"
                            : "outline"
                        }
                      >
                        {TOURNAMENT_STATUS_LABEL[t.status]}
                      </Badge>
                    </td>
                    <td className="nums py-3 pr-4 text-right text-paper/65">
                      {t.draws.length}
                    </td>
                    <td className="nums py-3 pr-4 text-right text-paper/65">
                      {t.totalTeams}
                    </td>
                    <td className="nums py-3 text-right text-volt">
                      {t.totalPrizePool > 0
                        ? formatMoney(t.totalPrizePool, t.currency)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rule-t py-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl leading-none">
            Partidos con plazas libres
          </h2>
          <Link
            href="/partidos/publicar"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/70 transition-colors hover:text-volt"
          >
            Publicar plaza
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {console_.openMatches.length === 0 ? (
          <EmptyState
            className="mt-6"
            title="No hay plazas libres publicadas"
            body="Si te queda una pista muerta, publícala y la comunidad la ocupa."
            actionLabel="Publicar plaza"
            actionHref="/partidos/publicar"
          />
        ) : (
          <ul className="mt-6 flex flex-col">
            {console_.openMatches.slice(0, 10).map((match) => (
              <li
                key={match.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/partidos/${match.id}`}
                    className="text-sm font-semibold transition-colors hover:text-volt"
                  >
                    {formatDate(match.startsAt)} a las{" "}
                    {formatTime(match.startsAt)}
                  </Link>
                  <p className="text-xs text-paper/55">
                    {match.court?.name ?? "Pista por asignar"}
                    <span className="mx-1.5 text-paper/25">/</span>
                    nivel {match.levelMin} a {match.levelMax}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="nums text-[13px] text-paper/60">
                    {match.players.length} de {match.spotsTotal}
                  </span>
                  <Badge tone={match.spotsLeft > 0 ? "accent" : "outline"}>
                    {MATCH_STATUS_LABEL[match.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

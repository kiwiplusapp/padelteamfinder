import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { BracketEditor } from "@/components/app/bracket-editor";
import { PageHeader } from "@/components/app/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { bracketByRound, getPlayer, getTournamentById } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  FORMAT_LABEL,
  GENDER_LABEL,
  TOURNAMENT_STATUS_LABEL,
} from "@/lib/domain/schemas";
import { formatDate, formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = getTournamentById(id);
  return { title: tournament ? `Gestionar ${tournament.name}` : "Torneo" };
}

export default async function ManageTournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const tournament = getTournamentById(id);
  if (!tournament) notFound();

  const requested = Array.isArray(sp.cuadro) ? sp.cuadro[0] : sp.cuadro;
  const draw =
    tournament.draws.find((d) => d.id === requested) ?? tournament.draws[0];
  const rounds = draw ? bracketByRound(draw.id) : [];

  return (
    <div className="shell">
      <Link
        href={`/admin?club=${tournament.clubId}`}
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/60 transition-colors hover:text-volt"
      >
        <ArrowLeft size={14} weight="bold" />
        Panel
      </Link>

      <PageHeader
        title={tournament.name}
        lead={`${formatDate(tournament.startsAt)} a ${formatDate(tournament.endsAt)} en ${tournament.club.name}.`}
        action={
          <Link
            href={`/torneos/${tournament.slug}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/70 transition-colors hover:text-volt"
          >
            Ver página pública
            <ArrowSquareOut size={14} weight="bold" />
          </Link>
        }
      />

      <div className="rule-t flex flex-wrap items-center gap-2 py-5">
        <Badge
          tone={
            tournament.status === "inscripcion-abierta" ? "accent" : "outline"
          }
        >
          {TOURNAMENT_STATUS_LABEL[tournament.status]}
        </Badge>
        <Badge tone="neutral">
          {tournament.registrationMode === "interna"
            ? "Inscripción en PadelParty"
            : "Inscripción en el club"}
        </Badge>
        {tournament.totalPrizePool > 0 && (
          <Badge tone="neutral">
            {formatMoney(tournament.totalPrizePool, tournament.currency)} en
            premios
          </Badge>
        )}
      </div>

      <div className="rule-t py-6">
        <h2 className="font-display text-xl leading-none">Cuadros</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tournament.draws.map((d) => {
            const active = d.id === draw?.id;
            return (
              <Link
                key={d.id}
                href={`/admin/torneos/${tournament.id}?cuadro=${d.id}`}
                aria-current={active ? "true" : undefined}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                  active
                    ? "border-volt bg-volt text-ink"
                    : "border-[var(--line-strong)] text-paper/75 hover:border-volt hover:text-volt"
                }`}
              >
                {d.name}
                <span className="nums ml-2 opacity-70">
                  {d.registeredTeams}/{d.maxTeams}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {draw && (
        <>
          <div className="rule-t grid grid-cols-2 gap-x-6 gap-y-5 py-6 sm:grid-cols-5">
            {[
              { label: "Categoría", value: CATEGORY_LABEL[draw.category] },
              { label: "Género", value: GENDER_LABEL[draw.gender] },
              { label: "Formato", value: FORMAT_LABEL[draw.format] },
              {
                label: "Cuota",
                value: formatMoney(draw.feePerTeam, draw.currency),
              },
              {
                label: "Plazas libres",
                value: String(draw.spotsLeft),
              },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                  {item.label}
                </p>
                <p className="mt-1.5 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-10 py-8 lg:grid-cols-12 lg:gap-12">
            <section className="lg:col-span-5">
              <h2 className="font-display text-xl leading-none">
                Parejas inscritas ({draw.registeredTeams})
              </h2>

              {draw.teams.length === 0 ? (
                <p className="mt-4 text-sm text-paper/55">
                  Todavía no hay parejas en este cuadro.
                </p>
              ) : (
                <ul className="mt-5 flex flex-col">
                  {draw.teams.map((team, i) => {
                    const members = team.playerIds
                      .map((pid) => getPlayer(pid))
                      .filter(Boolean);

                    return (
                      <li
                        key={team.id}
                        className="flex items-center gap-3 border-b border-[var(--line)] py-3 last:border-b-0"
                      >
                        <span className="nums w-6 shrink-0 text-[13px] text-paper/40">
                          {i + 1}
                        </span>
                        <div className="flex -space-x-2">
                          {members.map(
                            (m) =>
                              m && (
                                <Avatar
                                  key={m.id}
                                  id={m.id}
                                  name={m.name}
                                  size="xs"
                                  className="ring-2 ring-[var(--surface)]"
                                />
                              ),
                          )}
                        </div>
                        <p className="min-w-0 flex-1 truncate text-sm">
                          {members.map((m) => m?.name).join(" / ")}
                        </p>
                        {team.seed && (
                          <Badge tone="outline">Cabeza {team.seed}</Badge>
                        )}
                        <Badge tone={team.paid ? "neutral" : "outline"}>
                          {team.paid ? "Pagado" : "Pendiente"}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
              )}

              {draw.prizes.length > 0 && (
                <div className="rule-t mt-8 pt-8">
                  <h2 className="font-display text-xl leading-none">Premios</h2>
                  <ul className="mt-5 flex flex-col gap-3">
                    {draw.prizes.map((prize) => (
                      <li
                        key={prize.position}
                        className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-semibold">{prize.label}</p>
                          {prize.inKind && (
                            <p className="mt-0.5 text-[13px] text-paper/55">
                              {prize.inKind}
                            </p>
                          )}
                        </div>
                        {prize.amount ? (
                          <span className="nums shrink-0 font-semibold text-volt">
                            {formatMoney(prize.amount, prize.currency)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="lg:col-span-7">
              <h2 className="font-display text-xl leading-none">
                Llaves y resultados
              </h2>
              <p className="mt-2 text-[13px] text-paper/55">
                Escribe los sets como 6-4. Al guardar, la pareja ganadora pasa
                sola a la ronda siguiente.
              </p>

              <div className="mt-6">
                {rounds.length > 0 ? (
                  <BracketEditor drawId={draw.id} rounds={rounds} />
                ) : (
                  <p className="text-sm text-paper/55">
                    Este cuadro todavía no tiene llaves generadas.
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

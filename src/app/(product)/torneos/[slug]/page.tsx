import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowSquareOut,
  CalendarBlank,
  MapPin,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { BracketView } from "@/components/app/bracket-view";
import { PageHeader } from "@/components/app/page-header";
import { RegisterTeam } from "@/components/app/register-team";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { TOURNAMENT_COVERS, photo } from "@/data/images";
import { bracketByRound, getTournament, listPlayers } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  FORMAT_LABEL,
  GENDER_LABEL,
  TOURNAMENT_STATUS_LABEL,
} from "@/lib/domain/schemas";
import { formatDate, formatDateTime, formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = getTournament(slug);
  if (!tournament) return { title: "Torneo no encontrado" };
  return { title: tournament.name, description: tournament.summary };
}

export default async function TournamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tournament = getTournament(slug);
  if (!tournament) notFound();

  // The selected draw lives in the URL so a specific cuadro is linkable.
  const requested = Array.isArray(sp.cuadro) ? sp.cuadro[0] : sp.cuadro;
  const draw =
    tournament.draws.find((d) => d.id === requested) ?? tournament.draws[0];

  const rounds = draw ? bracketByRound(draw.id) : [];
  const registrationOpen = tournament.status === "inscripcion-abierta";
  const external = tournament.registrationMode === "externa";
  const players = listPlayers({ limit: 60 }).map((p) => ({
    id: p.id,
    name: p.name,
    level: p.level,
  }));

  return (
    <div className="pb-20">
      {/* Cover. Priority because it is the LCP element on this route. */}
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden">
        <Photo
          slot={
            TOURNAMENT_COVERS[tournament.slug] ??
            photo(tournament.slug, 1600, 900)
          }
          alt=""
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cobalt-900 via-cobalt-900/70 to-cobalt-900/30" />
      </div>

      <div className="shell -mt-24 relative">
        <Link
          href="/torneos"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/70 transition-colors hover:text-volt"
        >
          <ArrowLeft size={14} weight="bold" />
          Torneos
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Badge tone={registrationOpen ? "accent" : "outline"}>
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </Badge>
          {external && <Badge tone="neutral">Inscripción en el club</Badge>}
        </div>

        <PageHeader title={tournament.name} lead={tournament.summary} />

        <dl className="rule-t grid grid-cols-2 gap-x-6 gap-y-5 py-8 sm:grid-cols-4">
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              <CalendarBlank size={13} weight="bold" />
              Fechas
            </dt>
            <dd className="nums mt-1.5 text-lg">
              {formatDate(tournament.startsAt)} a {formatDate(tournament.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              <MapPin size={13} weight="bold" />
              Club
            </dt>
            <dd className="mt-1.5">
              <Link
                href={`/clubes/${tournament.club.slug}`}
                className="text-lg transition-colors hover:text-volt"
              >
                {tournament.club.name}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              <Trophy size={13} weight="bold" />
              Premios
            </dt>
            <dd className="nums mt-1.5 text-lg text-volt">
              {tournament.totalPrizePool > 0
                ? formatMoney(tournament.totalPrizePool, tournament.currency)
                : "En especie"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              Cierre de inscripción
            </dt>
            <dd className="nums mt-1.5 text-lg">
              {formatDate(tournament.registrationClosesAt)}
            </dd>
          </div>
        </dl>

        {tournament.description && (
          <div className="rule-t py-8">
            <p className="max-w-[68ch] leading-relaxed text-paper/75">
              {tournament.description}
            </p>
          </div>
        )}

        {/* Draw picker. Pills, because the set is small and switching is the
            main interaction on this page. */}
        <div className="rule-t py-8">
          <h2 className="font-display text-2xl leading-none">Cuadros</h2>

          <div className="mt-5 flex flex-wrap gap-2">
            {tournament.draws.map((d) => {
              const active = d.id === draw?.id;
              return (
                <Link
                  key={d.id}
                  href={`/torneos/${tournament.slug}?cuadro=${d.id}`}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                    active
                      ? "border-volt bg-volt text-ink"
                      : "border-[var(--line-strong)] text-paper/75 hover:border-volt hover:text-volt"
                  }`}
                >
                  {d.name}
                </Link>
              );
            })}
          </div>
        </div>

        {draw && (
          <div className="grid gap-10 pb-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Categoría
                  </dt>
                  <dd className="mt-1.5">{CATEGORY_LABEL[draw.category]}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Género
                  </dt>
                  <dd className="mt-1.5">{GENDER_LABEL[draw.gender]}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Formato
                  </dt>
                  <dd className="mt-1.5">{FORMAT_LABEL[draw.format]}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                    Cuota
                  </dt>
                  <dd className="nums mt-1.5">
                    {formatMoney(draw.feePerTeam, draw.currency)} por pareja
                  </dd>
                </div>
              </dl>

              {draw.prizes.length > 0 && (
                <div className="rule-t mt-8 pt-8">
                  <h3 className="font-display text-xl leading-none">Premios</h3>
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
            </div>

            <aside className="lg:col-span-5">
              <div className="border border-[var(--line)] bg-cobalt-850/50 p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl leading-none">
                    Inscripción
                  </h3>
                  <span className="nums text-[13px] text-paper/60">
                    {draw.registeredTeams} de {draw.maxTeams}
                  </span>
                </div>

                <p className="mt-2 text-[13px] text-paper/60">
                  {draw.spotsLeft > 0
                    ? `Quedan ${draw.spotsLeft} plazas en este cuadro.`
                    : "Cuadro completo. Se admite lista de espera."}
                </p>

                <div className="mt-6">
                  {!registrationOpen ? (
                    <p className="text-[13px] text-paper/60">
                      La inscripción está cerrada. Cierra el{" "}
                      {formatDateTime(tournament.registrationClosesAt)}.
                    </p>
                  ) : external ? (
                    <>
                      <p className="text-[13px] leading-relaxed text-paper/65">
                        {tournament.club.name} gestiona sus inscripciones fuera
                        de PadelParty. El cuadro se publica aquí y la plaza se
                        reserva en su web.
                      </p>
                      {tournament.externalUrl && (
                        <ButtonLink
                          href={tournament.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5"
                        >
                          Inscribirse en el club
                          <ArrowSquareOut size={16} weight="bold" />
                        </ButtonLink>
                      )}
                    </>
                  ) : (
                    <RegisterTeam
                      drawId={draw.id}
                      drawName={draw.name}
                      players={players}
                      spotsLeft={draw.spotsLeft}
                    />
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {rounds.length > 0 && (
          <div className="rule-t py-8">
            <h2 className="font-display text-2xl leading-none">Llaves</h2>
            <p className="mt-2 text-[13px] text-paper/60">
              {draw?.name}. Desliza para ver el cuadro completo.
            </p>
            <div className="mt-6 overflow-x-auto pb-4">
              <BracketView rounds={rounds} className="w-max" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

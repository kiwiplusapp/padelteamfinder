import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CurrencyEur,
  MapPin,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { JoinMatch } from "@/components/app/join-match";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMatch, listPlayers } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  GENDER_LABEL,
  MATCH_STATUS_LABEL,
  SIDE_LABEL,
  genderAllows,
} from "@/lib/domain/schemas";
import { formatDateTime, formatMoney } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return { title: "Partido no encontrado" };

  return {
    title: `${match.club.name}, ${formatDateTime(match.startsAt)}`,
    description: `Partido ${GENDER_LABEL[match.gender].toLowerCase()} de nivel ${match.levelMin} a ${match.levelMax} en ${match.club.location.city}.`,
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) notFound();

  const full = match.spotsLeft <= 0;

  // Only offer identities that could actually take the seat, so the picker
  // never sets someone up for a rejection they could not have predicted.
  const roster = listPlayers({ city: match.club.location.city, limit: 40 })
    .filter(
      (p) =>
        genderAllows(match.gender, p.gender) &&
        p.level >= match.levelMin &&
        p.level <= match.levelMax &&
        !match.playerIds.includes(p.id),
    )
    .map((p) => ({ id: p.id, name: p.name, level: p.level, gender: p.gender }));

  return (
    <div className="shell pb-20">
      <Link
        href="/partidos"
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-semibold text-paper/60 transition-colors hover:text-volt"
      >
        <ArrowLeft size={14} weight="bold" />
        Partidos
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={full ? "outline" : "accent"}>
              {full
                ? MATCH_STATUS_LABEL[match.status]
                : match.spotsLeft === 1
                  ? "Falta 1 jugador"
                  : `Faltan ${match.spotsLeft} jugadores`}
            </Badge>
            <Badge tone="neutral">{CATEGORY_LABEL[match.category]}</Badge>
            <Badge tone="neutral">{GENDER_LABEL[match.gender]}</Badge>
          </div>

          <h1 className="mt-5 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.92]">
            {match.club.name}
          </h1>

          <p className="mt-3 text-base text-paper/70">
            {formatDateTime(match.startsAt)}
          </p>

          <dl className="rule-t mt-8 grid grid-cols-2 gap-x-6 gap-y-5 pt-8 sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                <Clock size={13} weight="bold" />
                Duración
              </dt>
              <dd className="nums mt-1.5 text-lg">{match.durationMinutes} min</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                <CurrencyEur size={13} weight="bold" />
                Por jugador
              </dt>
              <dd className="nums mt-1.5 text-lg">
                {formatMoney(match.pricePerPlayer, match.currency)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                <UsersThree size={13} weight="bold" />
                Nivel
              </dt>
              <dd className="nums mt-1.5 text-lg">
                {match.levelMin} a {match.levelMax}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                <MapPin size={13} weight="bold" />
                Pista
              </dt>
              <dd className="mt-1.5 text-lg">
                {match.court?.name ?? "Por asignar"}
              </dd>
            </div>
          </dl>

          {match.notes && (
            <div className="rule-t mt-8 pt-8">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                Nota de quien organiza
              </h2>
              <p className="mt-3 max-w-[60ch] leading-relaxed text-paper/80">
                {match.notes}
              </p>
            </div>
          )}

          <div className="rule-t mt-8 pt-8">
            <h2 className="font-display text-xl leading-none">
              Quién va ({match.players.length} de {match.spotsTotal})
            </h2>

            <ul className="mt-5 flex flex-col">
              {match.players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center gap-3.5 border-b border-[var(--line)] py-3.5 last:border-b-0"
                >
                  <Avatar id={player.id} name={player.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {player.name}
                      {player.id === match.organizerId && (
                        <span className="ml-2 text-[11px] font-medium text-paper/45">
                          organiza
                        </span>
                      )}
                    </p>
                    <p className="nums text-xs text-paper/55">
                      Nivel {player.level}
                      <span className="mx-1.5 text-paper/25">/</span>
                      {SIDE_LABEL[player.side]}
                    </p>
                  </div>
                </li>
              ))}

              {Array.from({ length: match.spotsLeft }).map((_, i) => (
                <li
                  key={`free-${i}`}
                  className="flex items-center gap-3.5 border-b border-dashed border-[var(--line-strong)] py-3.5 last:border-b-0"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed border-[var(--line-strong)] text-paper/30">
                    ?
                  </span>
                  <p className="text-sm text-paper/45">Plaza libre</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action column. Sticky on desktop so the seat is always one click away. */}
        <aside className="lg:col-span-5">
          <div className="border border-[var(--line)] bg-cobalt-850/50 p-6 lg:sticky lg:top-24">
            <JoinMatch
              matchId={match.id}
              roster={roster}
              alreadyIn={match.playerIds}
              full={full}
            />

            <div className="rule-t mt-6 pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                Dónde se juega
              </h2>
              <Link
                href={`/clubes/${match.club.slug}`}
                className="mt-3 block font-display text-lg leading-tight transition-colors hover:text-volt"
              >
                {match.club.name}
              </Link>
              <p className="mt-1.5 text-[13px] leading-relaxed text-paper/60">
                {match.club.location.address}
                <br />
                {match.club.location.postalCode} {match.club.location.city}
              </p>
              {match.club.phone && (
                <a
                  href={`tel:${match.club.phone.replace(/\s/g, "")}`}
                  className="nums mt-3 inline-block text-[13px] text-paper/70 transition-colors hover:text-volt"
                >
                  {match.club.phone}
                </a>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

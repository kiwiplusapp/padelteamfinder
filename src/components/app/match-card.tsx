import Link from "next/link";
import { CalendarBlank, MapPin, CurrencyEur } from "@phosphor-icons/react/dist/ssr";
import { AvatarStack } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { MatchView } from "@/lib/domain/repo";
import { CATEGORY_LABEL, GENDER_LABEL } from "@/lib/domain/schemas";
import { formatDate, formatTime } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   The match card carries one decision: can I take this game?
   So the open-seat count is the only element allowed the accent colour, and
   everything else is ranked below it.
   -------------------------------------------------------------------------- */

export function MatchCard({
  match,
  className,
  compact = false,
}: {
  match: MatchView;
  className?: string;
  compact?: boolean;
}) {
  const open = match.spotsLeft > 0 && match.status === "abierto";

  return (
    <Link
      href={`/partidos/${match.id}`}
      className={cn(
        "group flex flex-col gap-4 border border-[var(--line)] bg-cobalt-850/40 p-5 transition-colors hover:border-volt/50",
        compact ? "w-[286px]" : "w-full",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="nums text-[13px] text-paper/60">
            {formatDate(match.startsAt)}
            <span className="mx-1.5 text-paper/30">/</span>
            {formatTime(match.startsAt)}
          </p>
          <h3 className="mt-1.5 truncate font-display text-xl leading-tight">
            {match.club.name}
          </h3>
        </div>

        {open ? (
          <Badge tone="accent">
            {match.spotsLeft === 1
              ? "Falta 1"
              : `Faltan ${match.spotsLeft}`}
          </Badge>
        ) : (
          <Badge tone="outline">Completo</Badge>
        )}
      </div>

      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-paper/65">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Zona</dt>
          <MapPin size={14} weight="bold" className="text-paper/40" />
          <dd className="truncate">
            {match.club.location.neighbourhood ?? match.club.location.city}
            {match.distanceKm !== null && (
              <span className="nums ml-1.5 text-paper/45">
                {formatDistance(match.distanceKm)}
              </span>
            )}
          </dd>
        </div>

        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Precio por jugador</dt>
          <CurrencyEur size={14} weight="bold" className="text-paper/40" />
          <dd className="nums">{match.pricePerPlayer.toFixed(2)}</dd>
        </div>

        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Duración</dt>
          <CalendarBlank size={14} weight="bold" className="text-paper/40" />
          <dd className="nums">{match.durationMinutes} min</dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="neutral">{CATEGORY_LABEL[match.category]}</Badge>
        <Badge tone="neutral">{GENDER_LABEL[match.gender]}</Badge>
        <Badge tone="outline">
          <span className="nums">
            Nivel {match.levelMin} a {match.levelMax}
          </span>
        </Badge>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <AvatarStack people={match.players} />
        <span className="text-[13px] font-semibold text-paper/70 transition-colors group-hover:text-volt">
          Ver partido
        </span>
      </div>
    </Link>
  );
}

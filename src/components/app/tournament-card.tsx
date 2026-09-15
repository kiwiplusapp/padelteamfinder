import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { TOURNAMENT_COVERS, photo } from "@/data/images";
import type { TournamentView } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  TOURNAMENT_STATUS_LABEL,
} from "@/lib/domain/schemas";
import { formatDate, formatMoney } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";

export function TournamentCard({ tournament }: { tournament: TournamentView }) {
  const open = tournament.status === "inscripcion-abierta";

  return (
    <Link
      href={`/torneos/${tournament.slug}`}
      className="group flex w-full flex-col border border-[var(--line)] bg-cobalt-850/40 transition-colors hover:border-volt/50"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Photo
          slot={
            TOURNAMENT_COVERS[tournament.slug] ??
            photo(tournament.slug, 1400, 900)
          }
          alt=""
          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cobalt-950/85 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={open ? "accent" : "outline"}>
            {TOURNAMENT_STATUS_LABEL[tournament.status]}
          </Badge>
          {tournament.registrationMode === "externa" && (
            <Badge tone="neutral">Inscripción en el club</Badge>
          )}
        </div>

        <div>
          <h3 className="font-display text-xl leading-tight">
            {tournament.name}
          </h3>
          <p className="nums mt-1.5 text-[13px] text-paper/60">
            {formatDate(tournament.startsAt)}
            <span className="mx-1.5 text-paper/30">/</span>
            {tournament.club.location.city}
            {tournament.distanceKm !== null && (
              <span className="ml-1.5 text-paper/45">
                {formatDistance(tournament.distanceKm)}
              </span>
            )}
          </p>
        </div>

        <p className="clamp-2 text-[13px] leading-relaxed text-paper/65">
          {tournament.summary}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {tournament.categories.slice(0, 3).map((c) => (
            <Badge key={c} tone="neutral">
              {CATEGORY_LABEL[c]}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 text-[13px]">
          <span className="nums text-paper/60">
            {tournament.totalTeams} parejas
          </span>
          {tournament.totalPrizePool > 0 ? (
            <span className="nums font-semibold text-volt">
              {formatMoney(tournament.totalPrizePool, tournament.currency)}
            </span>
          ) : (
            <span className="text-paper/45">Sin bote</span>
          )}
        </div>
      </div>
    </Link>
  );
}

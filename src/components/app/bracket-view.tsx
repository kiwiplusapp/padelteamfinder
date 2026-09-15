import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { BracketMatchView } from "@/lib/domain/repo";
import { roundLabel } from "@/lib/domain/schemas";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Bracket.

   Rounds are columns. Within a column the matches are spread evenly over the
   full height, which is what produces the classic doubling gap without any
   absolute positioning: each round has half the matches of the one before, so
   `justify-around` does the geometry for free and it reflows on mobile.

   Round 0 is the final. The repository orders rounds first-played to final.
   -------------------------------------------------------------------------- */

function ScoreCells({ match, side }: { match: BracketMatchView; side: "a" | "b" }) {
  if (!match.sets.length) {
    return <span className="nums w-10 text-right text-xs text-paper/30">-</span>;
  }

  return (
    <span className="flex items-center gap-1.5">
      {match.sets.map((set, i) => {
        const own = side === "a" ? set.a : set.b;
        const other = side === "a" ? set.b : set.a;
        return (
          <span
            key={i}
            className={cn(
              "nums w-4 text-right text-xs tabular-nums",
              own > other ? "font-semibold text-paper" : "text-paper/45",
            )}
          >
            {own}
          </span>
        );
      })}
    </span>
  );
}

function TeamRow({
  match,
  side,
}: {
  match: BracketMatchView;
  side: "a" | "b";
}) {
  const teamId = side === "a" ? match.teamAId : match.teamBId;
  const label = side === "a" ? match.teamALabel : match.teamBLabel;
  const isWinner = Boolean(match.winnerTeamId) && match.winnerTeamId === teamId;
  const decided = Boolean(match.winnerTeamId);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-3 py-2",
        isWinner && "bg-volt/10",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {isWinner && (
          <CheckCircle
            size={13}
            weight="fill"
            className="shrink-0 text-volt"
            aria-label="Pasa de ronda"
          />
        )}
        <span
          className={cn(
            "truncate text-[13px]",
            !teamId && "italic text-paper/35",
            isWinner ? "font-semibold text-paper" : "text-paper/70",
            decided && !isWinner && "text-paper/40",
          )}
        >
          {label}
        </span>
      </span>
      <ScoreCells match={match} side={side} />
    </div>
  );
}

export function BracketView({
  rounds,
  className,
}: {
  /** Ordered first played to final, as returned by bracketByRound(). */
  rounds: BracketMatchView[][];
  className?: string;
}) {
  if (!rounds.length) return null;

  return (
    <div className={cn("flex items-stretch gap-4", className)}>
      {rounds.map((round) => (
        <section
          key={round[0].round}
          className="flex w-[248px] shrink-0 flex-col"
        >
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/45">
            {roundLabel(round[0].round)}
          </h3>

          <div className="flex flex-1 flex-col justify-around gap-3">
            {round.map((match) => (
              <article
                key={match.id}
                className="divide-y divide-[var(--line)] border border-[var(--line)] bg-cobalt-850/50"
              >
                <TeamRow match={match} side="a" />
                <TeamRow match={match} side="b" />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

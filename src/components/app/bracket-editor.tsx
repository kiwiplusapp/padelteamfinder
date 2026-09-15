"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowsClockwise, FloppyDisk, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { BracketMatchView } from "@/lib/domain/repo";
import { roundLabel } from "@/lib/domain/schemas";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Result entry.

   The club types the sets; the server decides the winner and advances the pair,
   because bracket integrity must not depend on what a browser sends. When the
   sets are level (1-1 after a retirement, for example) the server asks for an
   explicit winner and this form surfaces that choice.
   -------------------------------------------------------------------------- */

type Draft = Record<string, string[]>;

function initialDraft(rounds: BracketMatchView[][]): Draft {
  const draft: Draft = {};
  rounds.flat().forEach((m) => {
    draft[m.id] = [0, 1, 2].map((i) => {
      const set = m.sets[i];
      return set ? `${set.a}-${set.b}` : "";
    });
  });
  return draft;
}

/** Accepts "6-4" and "6/4", rejects anything else. */
function parseSet(value: string): { a: number; b: number } | null {
  const match = value.trim().match(/^(\d{1,2})\s*[-/]\s*(\d{1,2})$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === b) return null;
  return { a, b };
}

export function BracketEditor({
  drawId,
  rounds,
}: {
  drawId: string;
  rounds: BracketMatchView[][];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => initialDraft(rounds));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  );

  const save = async (match: BracketMatchView, winnerTeamId?: string) => {
    setError(null);

    const sets = (draft[match.id] ?? [])
      .filter((v) => v.trim())
      .map(parseSet);

    if (!sets.length) {
      setError({ id: match.id, message: "Introduce al menos un set." });
      return;
    }
    if (sets.some((s) => s === null)) {
      setError({
        id: match.id,
        message: "Formato de set no válido. Usa 6-4.",
      });
      return;
    }

    setBusy(match.id);
    try {
      const res = await fetch(`/api/v1/draws/${drawId}/bracket`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          sets,
          winnerTeamId,
        }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError({
          id: match.id,
          message: body?.error?.message ?? "No se ha podido guardar.",
        });
        return;
      }
      router.refresh();
    } catch {
      setError({ id: match.id, message: "Sin conexión con el servidor." });
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async () => {
    setBusy("regen");
    setError(null);
    try {
      const res = await fetch(`/api/v1/draws/${drawId}/bracket`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json();
        setError({
          id: "regen",
          message: body?.error?.message ?? "No se ha podido generar el cuadro.",
        });
        return;
      }
      router.refresh();
    } catch {
      setError({ id: "regen", message: "Sin conexión con el servidor." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={regenerate}
          disabled={busy === "regen"}
        >
          <ArrowsClockwise size={15} weight="bold" />
          {busy === "regen" ? "Generando..." : "Regenerar llaves"}
        </Button>
        <p className="text-[13px] text-paper/55">
          Rehace el cuadro con las parejas inscritas. Borra los resultados.
        </p>
      </div>

      {error?.id === "regen" && (
        <p role="alert" className="flex items-center gap-2 text-[13px] text-volt">
          <Warning size={15} weight="fill" />
          {error.message}
        </p>
      )}

      {rounds.map((round) => (
        <section key={round[0].round}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/45">
            {roundLabel(round[0].round)}
          </h3>

          <ul className="mt-4 flex flex-col">
            {round.map((match) => {
              const playable = Boolean(match.teamAId && match.teamBId);
              const rowError = error?.id === match.id ? error.message : null;

              return (
                <li
                  key={match.id}
                  className="flex flex-col gap-3 border-b border-[var(--line)] py-4 last:border-b-0 lg:flex-row lg:items-center lg:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm",
                        match.winnerTeamId === match.teamAId
                          ? "font-semibold text-volt"
                          : "text-paper/80",
                      )}
                    >
                      {match.teamALabel}
                    </p>
                    <p
                      className={cn(
                        "mt-1 truncate text-sm",
                        match.winnerTeamId === match.teamBId
                          ? "font-semibold text-volt"
                          : "text-paper/80",
                      )}
                    >
                      {match.teamBLabel}
                    </p>
                  </div>

                  {playable ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {[0, 1, 2].map((i) => (
                        <label key={i}>
                          <span className="sr-only">
                            Set {i + 1} de {match.teamALabel} contra{" "}
                            {match.teamBLabel}
                          </span>
                          <input
                            value={draft[match.id]?.[i] ?? ""}
                            onChange={(e) =>
                              setDraft((prev) => {
                                const next = [...(prev[match.id] ?? ["", "", ""])];
                                next[i] = e.target.value;
                                return { ...prev, [match.id]: next };
                              })
                            }
                            placeholder={i === 2 ? "opcional" : "6-4"}
                            inputMode="numeric"
                            className="nums w-[74px] rounded-[2px] border border-[var(--line-strong)] bg-cobalt-950/60 px-2 py-1.5 text-center text-[13px] text-paper placeholder:text-paper/35 outline-none focus:border-volt"
                          />
                        </label>
                      ))}

                      <Button
                        size="sm"
                        onClick={() => save(match)}
                        disabled={busy === match.id}
                      >
                        <FloppyDisk size={14} weight="bold" />
                        {busy === match.id ? "..." : "Guardar"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[13px] text-paper/40 lg:w-[300px]">
                      Esperando a la ronda anterior
                    </p>
                  )}

                  {rowError && (
                    <p
                      role="alert"
                      className="flex w-full items-center gap-1.5 text-[13px] text-volt lg:w-auto"
                    >
                      <Warning size={14} weight="fill" />
                      {rowError}
                      {/* A level scoreline needs the club to say who goes through. */}
                      {rowError.includes("empatado") && (
                        <span className="ml-2 inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => save(match, match.teamAId!)}
                            className="underline underline-offset-2"
                          >
                            Pasa {match.teamALabel}
                          </button>
                          <button
                            type="button"
                            onClick={() => save(match, match.teamBId!)}
                            className="underline underline-offset-2"
                          >
                            Pasa {match.teamBLabel}
                          </button>
                        </span>
                      )}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

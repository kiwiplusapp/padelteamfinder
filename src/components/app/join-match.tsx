"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, SignIn, Warning } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { useCurrentPlayer } from "@/lib/use-current-player";
import type { Player } from "@/lib/domain/schemas";

/* ----------------------------------------------------------------------------
   Taking a seat.

   Posts to the same /api/v1 endpoint the mobile app will use, so the rules
   (level window, gender, capacity) are enforced in one place and the failure
   message the user reads is the one the API returned.
   -------------------------------------------------------------------------- */

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string }
  | { kind: "done" };

export function JoinMatch({
  matchId,
  roster,
  alreadyIn,
  full,
}: {
  matchId: string;
  /** Candidate identities while there is no auth. */
  roster: Array<Pick<Player, "id" | "name" | "level" | "gender">>;
  alreadyIn: string[];
  full: boolean;
}) {
  const router = useRouter();
  const { playerId, choose, ready } = useCurrentPlayer();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const me = roster.find((p) => p.id === playerId);
  const isIn = playerId ? alreadyIn.includes(playerId) : false;

  const join = async () => {
    if (!playerId) return;
    setStatus({ kind: "sending" });

    try {
      const res = await fetch(`/api/v1/matches/${matchId}/join`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      const body = await res.json();

      if (!res.ok) {
        setStatus({
          kind: "error",
          message: body?.error?.message ?? "No se ha podido completar.",
        });
        return;
      }
      setStatus({ kind: "done" });
      router.refresh();
    } catch {
      setStatus({
        kind: "error",
        message: "Sin conexión con el servidor. Inténtalo otra vez.",
      });
    }
  };

  if (!ready) {
    return <div className="h-11 w-44 animate-pulse rounded-full bg-paper/8" />;
  }

  if (isIn || status.kind === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-volt">
        <CheckCircle size={18} weight="fill" />
        Ya estás en este partido
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!playerId ? (
        <Field
          label="¿Quién eres?"
          htmlFor="identity"
          helper="Todavía no hay cuentas. Elige tu perfil para poder apuntarte."
        >
          <Select
            id="identity"
            defaultValue=""
            onChange={(e) => e.target.value && choose(e.target.value)}
          >
            <option value="" disabled>
              Selecciona tu perfil
            </option>
            {roster.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (nivel {p.level})
              </option>
            ))}
          </Select>
        </Field>
      ) : (
        <div className="flex items-center gap-2.5">
          <Avatar id={me?.id} name={me?.name ?? "?"} size="sm" highlight />
          <p className="text-[13px] text-paper/70">
            Te apuntas como{" "}
            <span className="font-semibold text-paper">{me?.name}</span>
          </p>
        </div>
      )}

      <Button
        onClick={join}
        disabled={!playerId || full || status.kind === "sending"}
        size="lg"
      >
        <SignIn size={18} weight="bold" />
        {full
          ? "Partido completo"
          : status.kind === "sending"
            ? "Apuntando..."
            : "Ocupar la plaza"}
      </Button>

      {status.kind === "error" && (
        <p
          role="alert"
          className="flex items-start gap-2 text-[13px] leading-snug text-volt"
        >
          <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
          {status.message}
        </p>
      )}
    </div>
  );
}

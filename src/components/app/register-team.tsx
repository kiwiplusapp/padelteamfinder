"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { useCurrentPlayer } from "@/lib/use-current-player";

/* ----------------------------------------------------------------------------
   Registering a pair for a draw.

   Beyond maxTeams the API accepts the entry onto the waiting list rather than
   refusing it, so the copy says so before the user commits.
   -------------------------------------------------------------------------- */

type PlayerOption = { id: string; name: string; level: number };

export function RegisterTeam({
  drawId,
  drawName,
  players,
  spotsLeft,
}: {
  drawId: string;
  drawName: string;
  players: PlayerOption[];
  spotsLeft: number;
}) {
  const router = useRouter();
  const { playerId, choose, ready } = useCurrentPlayer();
  const [partnerId, setPartnerId] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "confirmada" | "lista-espera">(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!playerId) return setError("Elige tu perfil.");
    if (!partnerId) return setError("Elige tu pareja.");
    if (partnerId === playerId)
      return setError("Tu pareja tiene que ser otra persona.");

    setSending(true);
    try {
      const res = await fetch(`/api/v1/draws/${drawId}/teams`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ playerIds: [playerId, partnerId] }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body?.error?.message ?? "No se ha podido inscribir la pareja.");
        return;
      }
      setDone(spotsLeft > 0 ? "confirmada" : "lista-espera");
      router.refresh();
    } catch {
      setError("Sin conexión con el servidor. Inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  };

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-[2px] bg-paper/8" />;
  }

  if (done) {
    return (
      <p className="flex items-start gap-2 text-sm font-semibold text-volt">
        <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
        {done === "confirmada"
          ? `Pareja inscrita en ${drawName}. El club confirmará el pago.`
          : `Cuadro lleno. Vuestra pareja queda en lista de espera de ${drawName}.`}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Field
        label="Tú"
        htmlFor={`me-${drawId}`}
        helper="Todavía no hay cuentas. Elige tu perfil."
        required
      >
        <Select
          id={`me-${drawId}`}
          value={playerId ?? ""}
          onChange={(e) => choose(e.target.value)}
        >
          <option value="" disabled>
            Selecciona tu perfil
          </option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (nivel {p.level})
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tu pareja" htmlFor={`partner-${drawId}`} required>
        <Select
          id={`partner-${drawId}`}
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
        >
          <option value="" disabled>
            Selecciona a tu pareja
          </option>
          {players
            .filter((p) => p.id !== playerId)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (nivel {p.level})
              </option>
            ))}
        </Select>
      </Field>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-[13px] leading-snug text-volt"
        >
          <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <Button type="submit" disabled={sending}>
        {sending
          ? "Inscribiendo..."
          : spotsLeft > 0
            ? "Inscribir pareja"
            : "Apuntarse a la lista de espera"}
      </Button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { useCurrentPlayer } from "@/lib/use-current-player";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  GENDER_LABEL,
  type Gender,
} from "@/lib/domain/schemas";

/* ----------------------------------------------------------------------------
   Publishing a match.

   Validation is deliberately not duplicated here: the form checks only what it
   can know locally (required fields, level ordering) and lets the API be the
   authority on everything else, rendering whatever it returns against the
   field it names.
   -------------------------------------------------------------------------- */

type ClubOption = {
  id: string;
  name: string;
  city: string;
  courts: Array<{ id: string; name: string; pricePerSlot: number }>;
};

type PlayerOption = { id: string; name: string; level: number };

type FieldErrors = Record<string, string>;

export function PublishMatchForm({
  clubs,
  players,
}: {
  clubs: ClubOption[];
  players: PlayerOption[];
}) {
  const router = useRouter();
  const { playerId, choose, ready } = useCurrentPlayer();

  const [clubId, setClubId] = useState(clubs[0]?.id ?? "");
  const [courtId, setCourtId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState("90");
  const [gender, setGender] = useState<Gender>("mixto");
  const [category, setCategory] = useState("tercera");
  const [levelMin, setLevelMin] = useState("3.5");
  const [levelMax, setLevelMax] = useState("4.5");
  const [price, setPrice] = useState("7");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const club = useMemo(() => clubs.find((c) => c.id === clubId), [clubs, clubId]);

  /** Today, as a yyyy-mm-dd string in local time, for the date input's min. */
  const today = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const next: FieldErrors = {};
    if (!playerId) next.organizerId = "Elige tu perfil para publicar.";
    if (!clubId) next.clubId = "Elige el club.";
    if (!date) next.date = "Indica el día.";
    if (Number(levelMin) > Number(levelMax))
      next.levelMin = "El nivel mínimo no puede superar al máximo.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      const startsAt = new Date(`${date}T${time}:00`).toISOString();

      const res = await fetch("/api/v1/matches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clubId,
          courtId: courtId || undefined,
          organizerId: playerId,
          playerIds: [playerId],
          startsAt,
          durationMinutes: Number(duration),
          gender,
          category,
          levelMin: Number(levelMin),
          levelMax: Number(levelMax),
          spotsTotal: 4,
          pricePerPlayer: Number(price),
          currency: "EUR",
          notes: notes.trim() || undefined,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        // Map the API's field paths back onto the form.
        const details: Array<{ path: string; message: string }> =
          body?.error?.details ?? [];
        if (details.length) {
          setErrors(
            Object.fromEntries(details.map((d) => [d.path, d.message])),
          );
        }
        setFormError(body?.error?.message ?? "No se ha podido publicar.");
        return;
      }

      router.push(`/partidos/${body.data.id}`);
    } catch {
      setFormError("Sin conexión con el servidor. Inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  };

  if (!ready) {
    return <div className="h-96 animate-pulse rounded-[2px] bg-paper/8" />;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <Field
        label="¿Quién publica?"
        htmlFor="organizer"
        helper="Todavía no hay cuentas. Elige tu perfil para continuar."
        error={errors.organizerId}
        required
      >
        <Select
          id="organizer"
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Club" htmlFor="club" error={errors.clubId} required>
          <Select
            id="club"
            value={clubId}
            onChange={(e) => {
              setClubId(e.target.value);
              setCourtId("");
            }}
          >
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.city})
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Pista"
          htmlFor="court"
          helper="Opcional si todavía no la tienes asignada."
        >
          <Select
            id="court"
            value={courtId}
            onChange={(e) => setCourtId(e.target.value)}
          >
            <option value="">Por asignar</option>
            {club?.courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Día" htmlFor="date" error={errors.date} required>
          <Input
            id="date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>

        <Field label="Hora" htmlFor="time" required>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Field>

        <Field label="Duración" htmlFor="duration">
          <Select
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="60">60 minutos</option>
            <option value="90">90 minutos</option>
            <option value="120">120 minutos</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Género" htmlFor="gender">
          <Select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            {Object.entries(GENDER_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Categoría" htmlFor="category">
          <Select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field
          label="Nivel mínimo"
          htmlFor="levelMin"
          error={errors.levelMin}
        >
          <Input
            id="levelMin"
            type="number"
            min="0"
            max="7"
            step="0.5"
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
          />
        </Field>

        <Field label="Nivel máximo" htmlFor="levelMax" error={errors.levelMax}>
          <Input
            id="levelMax"
            type="number"
            min="0"
            max="7"
            step="0.5"
            value={levelMax}
            onChange={(e) => setLevelMax(e.target.value)}
          />
        </Field>

        <Field
          label="Precio por jugador"
          htmlFor="price"
          helper="En euros, pista dividida entre cuatro."
        >
          <Input
            id="price"
            type="number"
            min="0"
            step="0.5"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Field>
      </div>

      <Field
        label="Nota"
        htmlFor="notes"
        helper="Opcional. Lo que quien se apunte debería saber antes de ir."
      >
        <Textarea
          id="notes"
          maxLength={280}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Pista reservada y pagada. Buscamos a alguien para el revés."
        />
      </Field>

      {formError && (
        <p
          role="alert"
          className="flex items-start gap-2 border border-volt/40 bg-volt/5 px-4 py-3 text-[13px] leading-snug text-volt"
        >
          <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
          {formError}
        </p>
      )}

      <div>
        <Button type="submit" size="lg" disabled={sending}>
          {sending ? "Publicando..." : "Publicar partido"}
        </Button>
      </div>
    </form>
  );
}

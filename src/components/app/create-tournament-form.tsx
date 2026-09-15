"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  FORMAT_LABEL,
  GENDER_LABEL,
  type CategoryTier,
  type Gender,
  type TournamentFormat,
} from "@/lib/domain/schemas";

/* ----------------------------------------------------------------------------
   Creating a tournament.

   A tournament is not one draw: clubs run a separate cuadro per category and
   gender, each with its own fee, cap and prizes. The form models that directly
   rather than flattening it, because flattening it is what forces clubs back
   into spreadsheets.
   -------------------------------------------------------------------------- */

type DrawDraft = {
  key: string;
  name: string;
  category: CategoryTier;
  gender: Gender;
  format: TournamentFormat;
  maxTeams: string;
  fee: string;
  firstPrize: string;
  secondPrize: string;
};

let drawCounter = 0;
function emptyDraw(): DrawDraft {
  drawCounter += 1;
  return {
    key: `draw-${drawCounter}`,
    name: "",
    category: "tercera",
    gender: "masculino",
    format: "eliminacion",
    maxTeams: "16",
    fee: "35",
    firstPrize: "",
    secondPrize: "",
  };
}

function isoAt(date: string, hour: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function CreateTournamentForm({ clubId }: { clubId: string }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [mode, setMode] = useState<"interna" | "externa">("interna");
  const [externalUrl, setExternalUrl] = useState("");
  const [draws, setDraws] = useState<DrawDraft[]>([emptyDraw()]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const patchDraw = (key: string, patch: Partial<DrawDraft>) =>
    setDraws((prev) =>
      prev.map((d) => (d.key === key ? { ...d, ...patch } : d)),
    );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Pon un nombre al torneo.";
    if (!summary.trim()) next.summary = "Una línea que lo resuma.";
    if (!startsAt) next.startsAt = "Indica cuándo empieza.";
    if (!endsAt) next.endsAt = "Indica cuándo acaba.";
    if (!closesAt) next.registrationClosesAt = "Indica cuándo cierra la inscripción.";
    if (mode === "externa" && !externalUrl.trim())
      next.externalUrl = "Pon el enlace donde se inscriben.";
    draws.forEach((d, i) => {
      if (!d.name.trim()) next[`draw-${i}`] = "Cada cuadro necesita un nombre.";
    });

    setErrors(next);
    if (Object.keys(next).length) return;

    // The prize pool is the sum of what the draws actually pay, so the public
    // figure can never drift from the prizes underneath it.
    const totalPrizePool = draws.reduce(
      (sum, d) => sum + Number(d.firstPrize || 0) + Number(d.secondPrize || 0),
      0,
    );

    setSending(true);
    try {
      const res = await fetch("/api/v1/tournaments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clubId,
          name: name.trim(),
          summary: summary.trim(),
          description: description.trim() || undefined,
          startsAt: isoAt(startsAt, 9),
          endsAt: isoAt(endsAt, 21),
          registrationClosesAt: isoAt(closesAt, 23),
          status: "inscripcion-abierta",
          registrationMode: mode,
          externalUrl: mode === "externa" ? externalUrl.trim() : undefined,
          totalPrizePool,
          currency: "EUR",
          draws: draws.map((d) => ({
            name: d.name.trim(),
            category: d.category,
            gender: d.gender,
            format: d.format,
            maxTeams: Number(d.maxTeams),
            feePerTeam: Number(d.fee),
            currency: "EUR",
            prizes: [
              ...(d.firstPrize
                ? [
                    {
                      position: 1,
                      label: "Campeones",
                      amount: Number(d.firstPrize),
                      currency: "EUR",
                    },
                  ]
                : []),
              ...(d.secondPrize
                ? [
                    {
                      position: 2,
                      label: "Finalistas",
                      amount: Number(d.secondPrize),
                      currency: "EUR",
                    },
                  ]
                : []),
            ],
          })),
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        const details: Array<{ path: string; message: string }> =
          body?.error?.details ?? [];
        if (details.length) {
          setErrors(Object.fromEntries(details.map((d) => [d.path, d.message])));
        }
        setFormError(body?.error?.message ?? "No se ha podido crear el torneo.");
        return;
      }

      router.push(`/admin/torneos/${body.data.id}`);
    } catch {
      setFormError("Sin conexión con el servidor. Inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-8" noValidate>
      <section className="flex flex-col gap-6">
        <Field label="Nombre" htmlFor="name" error={errors.name} required>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Open de Primavera"
          />
        </Field>

        <Field
          label="Resumen"
          htmlFor="summary"
          helper="Una línea. Es lo que se lee en el listado."
          error={errors.summary}
          required
        >
          <Input
            id="summary"
            maxLength={200}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Tres días de competición con cuadros masculino y femenino."
          />
        </Field>

        <Field
          label="Descripción"
          htmlFor="description"
          helper="Opcional. Bola oficial, horarios, normas de la casa."
        >
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Empieza" htmlFor="startsAt" error={errors.startsAt} required>
            <Input
              id="startsAt"
              type="date"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
          </Field>
          <Field label="Acaba" htmlFor="endsAt" error={errors.endsAt} required>
            <Input
              id="endsAt"
              type="date"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
          </Field>
          <Field
            label="Cierra inscripción"
            htmlFor="closesAt"
            error={errors.registrationClosesAt}
            required
          >
            <Input
              id="closesAt"
              type="date"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Inscripción"
            htmlFor="mode"
            helper="Si tu club no está afiliado, enlaza a tu propia web."
          >
            <Select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as "interna" | "externa")}
            >
              <option value="interna">Se gestiona en PadelParty</option>
              <option value="externa">Se gestiona en la web del club</option>
            </Select>
          </Field>

          {mode === "externa" && (
            <Field
              label="Enlace de inscripción"
              htmlFor="externalUrl"
              error={errors.externalUrl}
              required
            >
              <Input
                id="externalUrl"
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://miclub.es/torneos/open"
              />
            </Field>
          )}
        </div>
      </section>

      <section className="rule-t pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl leading-none">Cuadros</h2>
            <p className="mt-2 text-[13px] text-paper/55">
              Uno por categoría y género. Cada cuadro tiene su cuota y sus
              premios.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDraws((prev) => [...prev, emptyDraw()])}
          >
            <Plus size={15} weight="bold" />
            Añadir cuadro
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          {draws.map((draw, i) => (
            <fieldset
              key={draw.key}
              className="border border-[var(--line)] bg-cobalt-850/40 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <legend className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
                  Cuadro {i + 1}
                </legend>
                {draws.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setDraws((prev) => prev.filter((d) => d.key !== draw.key))
                    }
                    className="inline-flex items-center gap-1 text-[13px] text-paper/55 transition-colors hover:text-volt"
                  >
                    <Trash size={14} weight="bold" />
                    Quitar
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nombre del cuadro"
                  htmlFor={`${draw.key}-name`}
                  error={errors[`draw-${i}`]}
                  required
                >
                  <Input
                    id={`${draw.key}-name`}
                    value={draw.name}
                    onChange={(e) =>
                      patchDraw(draw.key, { name: e.target.value })
                    }
                    placeholder="Masculino 2ª"
                  />
                </Field>

                <Field label="Formato" htmlFor={`${draw.key}-format`}>
                  <Select
                    id={`${draw.key}-format`}
                    value={draw.format}
                    onChange={(e) =>
                      patchDraw(draw.key, {
                        format: e.target.value as TournamentFormat,
                      })
                    }
                  >
                    {Object.entries(FORMAT_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-4">
                <Field label="Categoría" htmlFor={`${draw.key}-cat`}>
                  <Select
                    id={`${draw.key}-cat`}
                    value={draw.category}
                    onChange={(e) =>
                      patchDraw(draw.key, {
                        category: e.target.value as CategoryTier,
                      })
                    }
                  >
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Género" htmlFor={`${draw.key}-gender`}>
                  <Select
                    id={`${draw.key}-gender`}
                    value={draw.gender}
                    onChange={(e) =>
                      patchDraw(draw.key, { gender: e.target.value as Gender })
                    }
                  >
                    {Object.entries(GENDER_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Parejas máximo" htmlFor={`${draw.key}-max`}>
                  <Select
                    id={`${draw.key}-max`}
                    value={draw.maxTeams}
                    onChange={(e) =>
                      patchDraw(draw.key, { maxTeams: e.target.value })
                    }
                  >
                    {["4", "8", "16", "32", "64"].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Cuota por pareja" htmlFor={`${draw.key}-fee`}>
                  <Input
                    id={`${draw.key}-fee`}
                    type="number"
                    min="0"
                    step="1"
                    value={draw.fee}
                    onChange={(e) => patchDraw(draw.key, { fee: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Premio campeones"
                  htmlFor={`${draw.key}-p1`}
                  helper="En euros. Déjalo vacío si el premio es en especie."
                >
                  <Input
                    id={`${draw.key}-p1`}
                    type="number"
                    min="0"
                    value={draw.firstPrize}
                    onChange={(e) =>
                      patchDraw(draw.key, { firstPrize: e.target.value })
                    }
                  />
                </Field>

                <Field label="Premio finalistas" htmlFor={`${draw.key}-p2`}>
                  <Input
                    id={`${draw.key}-p2`}
                    type="number"
                    min="0"
                    value={draw.secondPrize}
                    onChange={(e) =>
                      patchDraw(draw.key, { secondPrize: e.target.value })
                    }
                  />
                </Field>
              </div>
            </fieldset>
          ))}
        </div>
      </section>

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
          {sending ? "Creando..." : "Crear torneo"}
        </Button>
      </div>
    </form>
  );
}

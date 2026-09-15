"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { CaretDown, Crosshair, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Filters.

   The URL is the state. That makes every filtered view shareable, survives a
   refresh, and keeps the listing a server component: no client store, no
   hydration of the result set, and the back button behaves.
   -------------------------------------------------------------------------- */

export type FilterOption = { value: string; label: string };

export type FilterSpec = {
  /** Query-string key this control writes to. */
  key: string;
  label: string;
  options: FilterOption[];
};

export function FilterBar({
  filters,
  /** Show the "near me" control, which writes lat and lng. */
  geo = false,
  className,
}: {
  filters: FilterSpec[];
  geo?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    // A filter change always returns to the first page of results.
    next.delete("offset");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setGeoError("Tu navegador no comparte la ubicación.");
      return;
    }
    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = new URLSearchParams(params.toString());
        next.set("lat", pos.coords.latitude.toFixed(5));
        next.set("lng", pos.coords.longitude.toFixed(5));
        next.delete("city");
        next.delete("offset");
        setLocating(false);
        startTransition(() => {
          router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        });
      },
      () => {
        setLocating(false);
        setGeoError("No hemos podido acceder a tu ubicación.");
      },
      { timeout: 8000 },
    );
  };

  const nearby = params.has("lat") && params.has("lng");
  const activeCount =
    filters.filter((f) => params.get(f.key)).length + (nearby ? 1 : 0);

  const clearAll = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 transition-opacity",
          pending && "opacity-60",
        )}
      >
        {geo && (
          <button
            type="button"
            onClick={nearby ? () => {
              const next = new URLSearchParams(params.toString());
              next.delete("lat");
              next.delete("lng");
              startTransition(() => router.replace(`${pathname}?${next}`, { scroll: false }));
            } : locate}
            disabled={locating}
            aria-pressed={nearby}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:opacity-60",
              nearby
                ? "border-volt bg-volt text-ink"
                : "border-[var(--line-strong)] text-paper/80 hover:border-volt hover:text-volt",
            )}
          >
            <Crosshair size={15} weight="bold" />
            {locating ? "Buscando..." : nearby ? "Cerca de mí" : "Cerca de mí"}
          </button>
        )}

        {filters.map((filter) => {
          const current = params.get(filter.key) ?? "";
          return (
            <label key={filter.key} className="relative">
              <span className="sr-only">{filter.label}</span>
              <select
                value={current}
                onChange={(e) => setParam(filter.key, e.target.value || null)}
                className={cn(
                  "appearance-none rounded-full border py-2 pl-3.5 pr-9 text-[13px] font-semibold transition-colors",
                  current
                    ? "border-volt bg-volt text-ink"
                    : "border-[var(--line-strong)] bg-transparent text-paper/80 hover:border-volt",
                )}
              >
                <option value="" className="bg-cobalt-900 text-paper">
                  {filter.label}
                </option>
                {filter.options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-cobalt-900 text-paper"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <CaretDown
                size={13}
                weight="bold"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2",
                  current ? "text-ink" : "text-paper/50",
                )}
              />
            </label>
          );
        })}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-semibold text-paper/60 transition-colors hover:text-volt"
          >
            <X size={13} weight="bold" />
            Quitar filtros
          </button>
        )}
      </div>

      {geoError && (
        <p role="alert" className="text-xs text-volt">
          {geoError}
        </p>
      )}
    </div>
  );
}

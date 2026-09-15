"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Field, Select } from "@/components/ui/field";

/**
 * Which club the console is operating on. Kept in the URL rather than in a
 * store so a club admin can bookmark their own console, and so swapping clubs
 * is a normal navigation with working back-button behaviour.
 */
export function ClubSwitcher({
  clubs,
  current,
}: {
  clubs: Array<{ id: string; name: string; city: string }>;
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <Field
      label="Club"
      htmlFor="club-switcher"
      helper="Sin cuentas todavía: elige el club que estás gestionando."
      className="max-w-sm"
    >
      <Select
        id="club-switcher"
        value={current}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          next.set("club", e.target.value);
          router.replace(`${pathname}?${next.toString()}`);
        }}
      >
        {clubs.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.city})
          </option>
        ))}
      </Select>
    </Field>
  );
}

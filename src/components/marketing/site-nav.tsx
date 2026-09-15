"use client";

import Link from "next/link";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Marketing navigation. One line at desktop, 68px tall, four items plus one
   action. On mobile it collapses to a sheet rather than wrapping to two rows.
   -------------------------------------------------------------------------- */

const LINKS = [
  { href: "/partidos", label: "Partidos" },
  { href: "/torneos", label: "Torneos" },
  { href: "/clubes", label: "Clubes" },
  { href: "/para-clubes", label: "Para clubes" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 w-full border-b border-[var(--line)] bg-cobalt-900/85 backdrop-blur-md"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        className="shell flex h-[68px] items-center justify-between gap-6"
        aria-label="Principal"
      >
        <Link
          href="/"
          className="font-display text-xl leading-none tracking-tight"
        >
          Padel<span className="text-volt">Party</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-paper/70 transition-colors hover:text-paper"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ButtonLink href="/partidos" size="sm" className="hidden sm:inline-flex">
            Buscar partido
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-[var(--line-strong)] md:hidden"
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
          >
            {open ? <X size={18} weight="bold" /> : <List size={18} weight="bold" />}
          </button>
        </div>
      </nav>

      <div
        id="nav-sheet"
        hidden={!open}
        className={cn("border-t border-[var(--line)] md:hidden")}
      >
        <ul className="shell flex flex-col py-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-paper/85"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="py-3">
            <ButtonLink href="/partidos" size="sm" onClick={() => setOpen(false)}>
              Buscar partido
            </ButtonLink>
          </li>
        </ul>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Buildings,
  MagnifyingGlass,
  PlusCircle,
  Trophy,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Mobile tab bar.

   Phone users of this product are standing at a club deciding whether to play,
   so the primary actions live within thumb reach instead of behind a menu.
   Hidden from 768px up, where the header nav takes over.
   -------------------------------------------------------------------------- */

const TABS = [
  { href: "/partidos", label: "Partidos", icon: MagnifyingGlass },
  { href: "/torneos", label: "Torneos", icon: Trophy },
  { href: "/partidos/publicar", label: "Publicar", icon: PlusCircle },
  { href: "/clubes", label: "Clubes", icon: Buildings },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="pb-safe fixed inset-x-0 bottom-0 border-t border-[var(--line)] bg-cobalt-950/95 pt-2 backdrop-blur-md md:hidden"
      style={{ zIndex: "var(--z-tabbar)" }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          // "/partidos" must not light up while on "/partidos/publicar".
          const active =
            tab.href === "/partidos/publicar"
              ? pathname === tab.href
              : pathname === tab.href ||
                (pathname.startsWith(`${tab.href}/`) &&
                  pathname !== "/partidos/publicar");

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-1.5 text-[10px] font-semibold transition-colors",
                  active ? "text-volt" : "text-paper/55",
                )}
              >
                <Icon size={21} weight={active ? "fill" : "regular"} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/* ----------------------------------------------------------------------------
   Layout family: closing statement.

   One CTA intent on the whole page, "Buscar partido", repeated here with the
   same label it carries in the nav and the hero. No second phrasing of the
   same action anywhere on the page.
   -------------------------------------------------------------------------- */

const FOOTER_LINKS = [
  {
    title: "Jugar",
    links: [
      { href: "/partidos", label: "Partidos abiertos" },
      { href: "/partidos/publicar", label: "Publicar partido" },
      { href: "/clubes", label: "Clubes y pistas" },
    ],
  },
  {
    title: "Competir",
    links: [
      { href: "/torneos", label: "Torneos" },
      { href: "/torneos?estado=en-juego", label: "En juego" },
    ],
  },
  {
    title: "Clubes",
    links: [
      { href: "/para-clubes", label: "Cómo funciona" },
      { href: "/admin", label: "Panel de club" },
      { href: "/api/v1/meta", label: "API" },
    ],
  },
] as const;

export function ClosingCta() {
  return (
    <>
      <section className="rule-t py-20 md:py-32">
        <div className="shell">
          <Reveal>
            <h2 className="max-w-[14ch] font-display text-[clamp(2.5rem,9vw,6.5rem)] leading-[0.86]">
              Alguien busca
              <br />
              <span className="text-volt">tu cuarto sitio.</span>
            </h2>
            <div className="mt-10">
              <ButtonLink href="/partidos" size="lg">
                Buscar partido
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="rule-t py-12">
        <div className="shell grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-2xl leading-none">
              Padel<span className="text-volt">Party</span>
            </p>
            <p className="mt-3 max-w-[32ch] text-[13px] leading-relaxed text-paper/55">
              Encuentra con quién jugar, en tu ciudad y a tu nivel.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <nav key={group.title} className="md:col-span-2" aria-label={group.title}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/40">
                {group.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-paper/70 transition-colors hover:text-volt"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </footer>
    </>
  );
}

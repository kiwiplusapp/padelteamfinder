import {
  Broadcast,
  Trophy,
  UsersThree,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { listClubs, platformTotals } from "@/lib/domain/repo";

/* ----------------------------------------------------------------------------
   Layout family: full-width statement with an accent gutter.

   The audience changes here from player to club, and the section is tinted a
   step darker to mark that, staying inside the same theme family. The page
   never inverts: one theme, top to bottom.
   -------------------------------------------------------------------------- */

const CAPABILITIES = [
  {
    icon: Trophy,
    title: "Torneos y cuadros",
    body: "Crea el torneo, abre cuadros por categoría y género, y genera las llaves con un clic.",
  },
  {
    icon: Wallet,
    title: "Premios e inscripciones",
    body: "Define el bote, la cuota por pareja y el cierre. La lista de espera se gestiona sola.",
  },
  {
    icon: UsersThree,
    title: "Jugadores del club",
    body: "Sube tu padrón de socios, asigna categorías y ve quién se apunta a qué.",
  },
  {
    icon: Broadcast,
    title: "Publica plazas libres",
    body: "Si te queda una pista muerta a las 19:00, publícala y se llena desde la comunidad.",
  },
] as const;

export function ForClubs() {
  const totals = platformTotals();
  const { items: clubs } = listClubs({ limit: 8 });

  // Doubled so the marquee loop is seamless at -50%.
  const strip = [...clubs, ...clubs];

  return (
    <section className="rule-t bg-cobalt-950 py-16 md:py-24">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-volt">
                Para clubes
              </p>
              <h2 className="mt-3 font-display text-[clamp(2rem,5vw,3.75rem)] leading-[0.9]">
                Tu club, donde ya buscan pista
              </h2>
              <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-paper/65">
                Publica torneos, gestiona cuadros y llena las horas flojas. Si
                tu club no está afiliado, aparece igual y la inscripción va a tu
                web.
              </p>
              <div className="mt-8">
                <ButtonLink href="/admin" size="lg">
                  Abrir panel de club
                </ButtonLink>
              </div>
              <p className="nums mt-5 text-[13px] text-paper/50">
                {totals.clubs} clubes, {totals.courts} pistas,{" "}
                {totals.players} jugadores registrados.
              </p>
            </Reveal>
          </div>

          {/* Accent gutter: the volt rule ties the column to the brand without
              a second accent colour or a card container per item. */}
          <div className="lg:col-span-7">
            <div className="flex flex-col border-l-2 border-volt pl-6 md:pl-10">
              {CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <Reveal key={cap.title} delay={i * 0.06}>
                    <article
                      className={
                        i === 0
                          ? "pb-7"
                          : "rule-t py-7 last:pb-0"
                      }
                    >
                      <Icon size={22} weight="bold" className="text-volt" />
                      <h3 className="mt-3 font-display text-xl leading-none">
                        {cap.title}
                      </h3>
                      <p className="mt-2.5 max-w-[50ch] text-sm leading-relaxed text-paper/65">
                        {cap.body}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/*
        The single marquee on the page. Breadth of clubs is the message and no
        individual name needs its own moment, which is what a marquee is for.
        Pauses on hover, stops dead under reduced motion.
      */}
      <div
        className="marquee mt-14 overflow-hidden border-y border-[var(--line)] py-4"
        aria-hidden="true"
      >
        <div className="marquee-track items-center gap-10 pr-10">
          {strip.map((club, i) => (
            <span
              key={`${club.id}-${i}`}
              className="font-display text-2xl leading-none whitespace-nowrap text-paper/25"
            >
              {club.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

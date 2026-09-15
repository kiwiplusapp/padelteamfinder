import type { Metadata } from "next";
import {
  Broadcast,
  ChartLineUp,
  Trophy,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { PageHeader } from "@/components/app/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { listClubs, platformTotals } from "@/lib/domain/repo";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Para clubes",
  description:
    "Publica torneos, gestiona cuadros y llena las horas flojas de tus pistas.",
};

const WHAT_YOU_GET = [
  {
    icon: Trophy,
    title: "Torneos y cuadros",
    body: "Crea el torneo, abre un cuadro por categoría y género, fija cuota y premios, y genera las llaves cuando cierres inscripción.",
  },
  {
    icon: Broadcast,
    title: "Horas flojas que se llenan solas",
    body: "Publica la pista que te queda muerta a las 19:00 y la comunidad la ocupa. No hace falta que llames a nadie.",
  },
  {
    icon: UsersThree,
    title: "Padrón de socios",
    body: "Sube tus jugadores con su categoría y nivel, y ve quién se apunta a qué sin cruzar hojas de cálculo.",
  },
  {
    icon: ChartLineUp,
    title: "Inscripciones y lista de espera",
    body: "Cuando el cuadro se llena, las parejas siguientes entran en espera automáticamente y avanzan si alguien cae.",
  },
] as const;

/**
 * Reads live data from the repository, so it must render per request. Without
 * this Next prerenders it at build time and the listing freezes on whatever was
 * true when the build ran.
 */
export const dynamic = "force-dynamic";

export default function ForClubsPage() {
  const totals = platformTotals();
  const { items: clubs } = listClubs({ limit: 12 });
  const affiliated = clubs.filter((c) => c.affiliated).length;

  return (
    <div className="shell pb-20">
      <PageHeader
        title="Para clubes"
        lead="Tu club aparece donde la gente ya está buscando pista. Afiliado o no."
        action={<ButtonLink href="/admin">Abrir panel de club</ButtonLink>}
      />

      {/* Derived counters. Nothing on this page is a made-up figure. */}
      <dl className="rule-t grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4">
        {[
          { label: "Clubes listados", value: String(totals.clubs) },
          { label: "Pistas activas", value: String(totals.courts) },
          { label: "Jugadores registrados", value: String(totals.players) },
          {
            label: "En premios ahora mismo",
            value: formatMoney(totals.prizePool),
          },
        ].map((stat) => (
          <div key={stat.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-paper/45">
              {stat.label}
            </dt>
            <dd className="nums mt-2 font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none text-volt">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="rule-t py-10">
        <h2 className="max-w-[20ch] font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[0.92]">
          Lo que puedes hacer desde el panel
        </h2>

        <div className="mt-10 flex flex-col border-l-2 border-volt pl-6 md:pl-10">
          {WHAT_YOU_GET.map((item, i) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <article className={i === 0 ? "pb-7" : "rule-t py-7 last:pb-0"}>
                  <Icon size={22} weight="bold" className="text-volt" />
                  <h3 className="mt-3 font-display text-xl leading-none">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 max-w-[56ch] text-sm leading-relaxed text-paper/70">
                    {item.body}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="rule-t py-10">
        <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[0.92]">
          Afiliado o no, apareces
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="border border-volt/50 bg-volt/5 p-6">
            <h3 className="font-display text-xl leading-none text-volt">
              Club afiliado
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/75">
              Las inscripciones se gestionan aquí. Cobras la cuota, controlas la
              lista de espera y cargas los resultados en las llaves.
            </p>
            <p className="nums mt-5 text-[13px] text-paper/55">
              {affiliated} de {clubs.length} clubes listados están afiliados.
            </p>
          </article>

          <article className="border border-[var(--line)] p-6">
            <h3 className="font-display text-xl leading-none">
              Club no afiliado
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/75">
              Tu torneo se publica igual, con su cuadro y sus premios, y el
              botón de inscripción lleva a tu web. No cambias tu operativa.
            </p>
            <p className="mt-5 text-[13px] text-paper/55">
              Sin coste y sin integración.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

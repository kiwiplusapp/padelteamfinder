import { Reveal } from "@/components/ui/reveal";

/* ----------------------------------------------------------------------------
   Layout family: editorial stack.

   Deliberately not three equal cards and not numbered stages. Each beat is a
   verb, indented progressively so the eye walks down and to the right, which
   is the closest a static layout gets to describing a sequence.
   -------------------------------------------------------------------------- */

const BEATS = [
  {
    verb: "Publica",
    body: "Pon la pista, la hora y el nivel que buscas. Tarda menos que escribir en el grupo de WhatsApp.",
    indent: "md:ml-0",
  },
  {
    verb: "Entra",
    body: "Mira quién juega, a qué nivel y a cuánto sale. Si encaja, ocupas la plaza y queda confirmado.",
    indent: "md:ml-[12%]",
  },
  {
    verb: "Juega",
    body: "El club recibe la reserva, tú recibes la dirección y el resto de la pareja. Nadie se queda colgado.",
    indent: "md:ml-[24%]",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="rule-t py-16 md:py-28">
      <div className="shell">
        <Reveal>
          <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5.5vw,4rem)] leading-[0.9]">
            Tres pasos y estás en la pista
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-px">
          {BEATS.map((beat, i) => (
            <Reveal key={beat.verb} delay={i * 0.08}>
              <article
                className={`rule-t flex flex-col gap-3 py-8 md:flex-row md:items-baseline md:gap-10 ${beat.indent}`}
              >
                <h3 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.85] text-volt md:w-[5.5ch] md:shrink-0">
                  {beat.verb}
                </h3>
                <p className="max-w-[46ch] text-base leading-relaxed text-paper/70">
                  {beat.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

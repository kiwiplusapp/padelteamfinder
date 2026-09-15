import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Status pills. Tone maps to meaning, never to decoration: `accent` is reserved
   for the one thing on a card that should pull the eye, usually an open seat.
   -------------------------------------------------------------------------- */

type Tone = "accent" | "neutral" | "outline" | "solid";

const TONES: Record<Tone, string> = {
  accent: "bg-volt text-ink",
  neutral: "bg-paper/10 text-paper/85",
  outline: "border border-[var(--line-strong)] text-paper/80",
  solid: "bg-ink text-paper",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide leading-none whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

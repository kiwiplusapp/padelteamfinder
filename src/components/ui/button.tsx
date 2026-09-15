import Link from "next/link";
import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Buttons are the only full-round shape in the system. Every variant below has
   been checked for WCAG AA contrast against the surfaces it is allowed to sit
   on, and labels never wrap: keep them to three words.
   -------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // volt on ink: 14.8:1
  primary:
    "bg-volt text-ink hover:bg-volt-bright active:translate-y-px border border-volt",
  // paper border on cobalt: reads as a real control, not a floating label
  secondary:
    "bg-transparent text-paper border border-[var(--line-strong)] hover:border-volt hover:text-volt active:translate-y-px",
  ghost:
    "bg-transparent text-paper/80 border border-transparent hover:text-paper hover:bg-paper/8 active:translate-y-px",
  // for use on the paper-coloured surfaces only
  inverse:
    "bg-ink text-paper border border-ink hover:bg-cobalt-900 active:translate-y-px",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight whitespace-nowrap transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-out-expo)] disabled:opacity-45 disabled:pointer-events-none";

export type ButtonProps = {
  variant?: Variant;
  size?: Size;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}

export type ButtonLinkProps = {
  variant?: Variant;
  size?: Size;
  href: string;
} & Omit<React.ComponentProps<typeof Link>, "href">;

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
      {...props}
    />
  );
}

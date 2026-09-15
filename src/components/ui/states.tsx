import { cn } from "@/lib/utils";
import { ButtonLink } from "./button";

/* ----------------------------------------------------------------------------
   Loading, empty and error states.

   Skeletons mirror the shape of what is arriving, so the layout does not jump
   when real content lands. Empty states always say how to populate the view.
   -------------------------------------------------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[2px] bg-paper/8",
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Matches the geometry of a match card so the swap is invisible. */
export function MatchCardSkeleton() {
  return (
    <div className="rule-t flex flex-col gap-4 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-6 w-52" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  className,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 border border-dashed border-[var(--line-strong)] px-6 py-12",
        className,
      )}
    >
      <div className="max-w-[48ch]">
        <h3 className="font-display text-2xl leading-none">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-paper/65">{body}</p>
      </div>
      {actionLabel && actionHref && (
        <ButtonLink href={actionHref} size="sm">
          {actionLabel}
        </ButtonLink>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Algo ha fallado",
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 border border-volt/40 bg-volt/5 px-6 py-8"
    >
      <div className="max-w-[48ch]">
        <h3 className="font-display text-xl leading-none text-volt">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-paper/75">{body}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full border border-volt px-4 py-2 text-[13px] font-semibold text-volt transition-colors hover:bg-volt hover:text-ink"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

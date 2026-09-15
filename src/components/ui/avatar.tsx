import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Monogram avatars.

   Player photography is the one asset a stock image cannot fake: a random face
   attached to a named person reads as dishonest. Initials on a deterministic
   shade of the brand field are specific, stable per player, and never uncanny.
   The moment real profile photos exist, pass `src` and this falls away.
   -------------------------------------------------------------------------- */

const SHADES = [
  "bg-cobalt-700",
  "bg-cobalt-600",
  "bg-cobalt-800",
  "bg-cobalt-500",
  "bg-cobalt-850",
] as const;

const SIZES = {
  xs: "size-6 text-[9px]",
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-14 text-sm",
  xl: "size-20 text-lg",
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Stable hash so a player keeps the same shade across every surface. */
function shadeFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return SHADES[Math.abs(hash) % SHADES.length];
}

export function Avatar({
  name,
  id,
  size = "md",
  highlight = false,
  className,
}: {
  name: string;
  id?: string;
  size?: keyof typeof SIZES;
  /** Marks the signed-in player. The only place volt appears on an avatar. */
  highlight?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight select-none",
        SIZES[size],
        highlight ? "bg-volt text-ink" : `${shadeFor(id ?? name)} text-paper`,
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/** Overlapping row used on match cards to show who is already in. */
export function AvatarStack({
  people,
  max = 4,
  size = "sm",
}: {
  people: Array<{ id: string; name: string }>;
  max?: number;
  size?: keyof typeof SIZES;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((p) => (
          <Avatar
            key={p.id}
            id={p.id}
            name={p.name}
            size={size}
            className="ring-2 ring-[var(--surface)]"
          />
        ))}
      </div>
      {rest > 0 && (
        <span className="ml-2 text-xs text-paper/55 nums">+{rest}</span>
      )}
      <span className="sr-only">
        {people.map((p) => p.name).join(", ")}
      </span>
    </div>
  );
}

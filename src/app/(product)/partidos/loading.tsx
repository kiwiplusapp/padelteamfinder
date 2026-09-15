import { MatchCardSkeleton } from "@/components/ui/states";

/** Mirrors the listing's geometry so the swap to real cards does not jump. */
export default function Loading() {
  return (
    <div className="shell pt-10 md:pt-14">
      <div className="h-12 w-72 animate-pulse rounded-[2px] bg-paper/8" />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

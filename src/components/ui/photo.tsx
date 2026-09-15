"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { imageUrl, type ImageSlot } from "@/data/images";

/* ----------------------------------------------------------------------------
   Photographic slot.

   Renders the manifest's resolved URL and, if that image fails (offline, a club
   asset not yet uploaded), degrades to the brand field with the court's own
   line geometry rather than a grey box or a broken-image icon.
   -------------------------------------------------------------------------- */

export function Photo({
  slot,
  alt,
  className,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  priority = false,
  fill = true,
}: {
  slot: ImageSlot;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <CourtFallback className={className} />;
  }

  return (
    <Image
      src={imageUrl(slot)}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

/**
 * The fallback is a padel court seen from above: real geometry, drawn at the
 * proportions of a regulation 20x10 court, not decorative filler.
 */
export function CourtFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-cobalt-850",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 100"
        className="h-full w-full opacity-25"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="200" height="100" fill="var(--color-cobalt-800)" />
        <g
          fill="none"
          stroke="var(--color-paper)"
          strokeWidth="0.9"
          opacity="0.55"
        >
          <rect x="10" y="10" width="180" height="80" />
          <line x1="100" y1="10" x2="100" y2="90" />
          <line x1="40" y1="10" x2="40" y2="90" />
          <line x1="160" y1="10" x2="160" y2="90" />
          <line x1="40" y1="50" x2="160" y2="50" />
        </g>
      </svg>
    </div>
  );
}

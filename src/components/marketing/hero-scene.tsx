"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "motion/react";

/**
 * Client leaf for the hero's WebGL layer.
 *
 * Isolated so the hero itself can stay a server component and read the
 * filesystem. The scene is code-split and never blocks the headline.
 */
const CourtScene = dynamic(() => import("@/components/three/court-scene"), {
  ssr: false,
});

export function HeroScene({ showCage }: { showCage: boolean }) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-0">
      <CourtScene still={Boolean(reduce)} showCage={showCage} />
    </div>
  );
}

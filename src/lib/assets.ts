import fs from "node:fs";
import path from "node:path";

import type { ImageSlot } from "@/data/images";

/* ----------------------------------------------------------------------------
   Asset presence.

   Sections that depend on a specific photograph ask this before composing, so a
   missing file produces a different (still finished) layout rather than a hole
   or a broken image. Server only: it reads the filesystem.

   The answer is memoised per path. In development the cache is skipped so a
   file dropped into /public while the dev server runs is picked up on the next
   request instead of after a restart.
   -------------------------------------------------------------------------- */

const cache = new Map<string, boolean>();

export function hasAsset(slot: ImageSlot): boolean {
  const local = slot.local;
  if (!local) return false;

  if (process.env.NODE_ENV === "production" && cache.has(local)) {
    return cache.get(local)!;
  }

  // Strip the leading slash: /img/x.jpg lives at public/img/x.jpg.
  const filePath = path.join(process.cwd(), "public", local.replace(/^\//, ""));

  let exists = false;
  try {
    exists = fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
  } catch {
    exists = false;
  }

  cache.set(local, exists);
  return exists;
}

/** Which of a set of slots are actually on disk. Used by the hero and README. */
export function presentAssets(slots: readonly ImageSlot[]): ImageSlot[] {
  return slots.filter(hasAsset);
}

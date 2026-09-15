import fs from "node:fs";
import path from "node:path";

import {
  bracket as seedBracket,
  clubs as seedClubs,
  courts as seedCourts,
  draws as seedDraws,
  matches as seedMatches,
  players as seedPlayers,
  registrations as seedRegistrations,
  teams as seedTeams,
  tournaments as seedTournaments,
} from "@/data/seed";
import type {
  BracketMatch,
  Club,
  Court,
  JoinRequest,
  OpenMatch,
  Player,
  Registration,
  Team,
  Tournament,
  TournamentDraw,
} from "./schemas";

/* ============================================================================
   Persistence.

   The store is an in-memory snapshot hydrated from the seed and, when present,
   overlaid with whatever has been written to .data/db.json. Mutations write the
   whole snapshot back, which is more than fast enough at this data size and
   keeps the file human-readable while the product is still taking shape.

   Everything here sits behind the repository functions in repo.ts. Swapping to
   Postgres means reimplementing that file, not this one and not the callers.
   ========================================================================== */

export type Snapshot = {
  clubs: Club[];
  courts: Court[];
  players: Player[];
  matches: OpenMatch[];
  tournaments: Tournament[];
  draws: TournamentDraw[];
  teams: Team[];
  registrations: Registration[];
  bracket: BracketMatch[];
  joinRequests: JoinRequest[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function freshSnapshot(): Snapshot {
  return {
    clubs: structuredClone(seedClubs),
    courts: structuredClone(seedCourts),
    players: structuredClone(seedPlayers),
    matches: structuredClone(seedMatches),
    tournaments: structuredClone(seedTournaments),
    draws: structuredClone(seedDraws),
    teams: structuredClone(seedTeams),
    registrations: structuredClone(seedRegistrations),
    bracket: structuredClone(seedBracket),
    joinRequests: [],
  };
}

function load(): Snapshot {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw) as Partial<Snapshot>;
      // Merge over a fresh snapshot so a partial or older file still boots.
      return { ...freshSnapshot(), ...parsed };
    }
  } catch (error) {
    console.warn(
      "[db] No se pudo leer .data/db.json, se arranca desde el seed.",
      error,
    );
  }
  return freshSnapshot();
}

/**
 * Next.js reloads modules on every edit in development. Parking the snapshot on
 * globalThis keeps writes from being silently discarded between requests.
 */
const globalStore = globalThis as unknown as { __padelparty?: Snapshot };

export const db: Snapshot = globalStore.__padelparty ?? load();
globalStore.__padelparty = db;

let writeQueued = false;

/** Persist the snapshot. Batched to one write per tick under burst mutations. */
export function persist() {
  if (writeQueued) return;
  writeQueued = true;

  queueMicrotask(() => {
    writeQueued = false;
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    } catch (error) {
      console.error("[db] No se pudo guardar el estado en disco.", error);
    }
  });
}

/** Drop persisted state and return to the seed. Used by the reset endpoint. */
export function resetToSeed() {
  const fresh = freshSnapshot();
  (Object.keys(fresh) as Array<keyof Snapshot>).forEach((key) => {
    // Mutate in place so existing references stay valid.
    (db[key] as unknown[]).length = 0;
    (db[key] as unknown[]).push(...(fresh[key] as unknown[]));
  });
  persist();
}

/** Monotonic id with a readable prefix. */
export function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

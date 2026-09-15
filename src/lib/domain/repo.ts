import { byProximity, distanceKm } from "@/lib/geo";
import { db, nextId, persist } from "./db";
import {
  CATEGORY_ORDER,
  GENDER_LABEL,
  genderAllows,
  type BracketMatch,
  type CategoryTier,
  type Club,
  type ClubQuery,
  type Court,
  type CreateMatchInput,
  type CreateTournamentInput,
  type MatchQuery,
  type OpenMatch,
  type Player,
  type SetScore,
  type Team,
  type Tournament,
  type TournamentDraw,
  type TournamentQuery,
  spotsLeft,
} from "./schemas";
import { slugify } from "@/lib/utils";

/* ============================================================================
   Repository.

   Every read the UI and the API perform goes through this module. Views are
   returned already enriched (club, organizer, distance, derived counts) so a
   page never has to stitch together three collections by hand, and so the
   mobile API returns the same shape the web renders.
   ========================================================================== */

export type Paged<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

function paginate<T>(items: T[], limit: number, offset: number): Paged<T> {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

/* ------------------------------------------------------------------ lookups */

export function getPlayer(id: string): Player | undefined {
  return db.players.find((p) => p.id === id);
}

export function getClub(id: string): Club | undefined {
  return db.clubs.find((c) => c.id === id);
}

export function getClubBySlug(slug: string): Club | undefined {
  return db.clubs.find((c) => c.slug === slug);
}

export function getCourt(id: string): Court | undefined {
  return db.courts.find((c) => c.id === id);
}

export function listCities(): string[] {
  return [...new Set(db.clubs.map((c) => c.location.city))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

/* ------------------------------------------------------------- match views */

export type MatchView = OpenMatch & {
  club: Club;
  court?: Court;
  organizer: Player;
  players: Player[];
  spotsLeft: number;
  distanceKm: number | null;
};

function toMatchView(
  match: OpenMatch,
  origin: { lat: number; lng: number } | null,
): MatchView | null {
  const club = getClub(match.clubId);
  const organizer = getPlayer(match.organizerId);
  if (!club || !organizer) return null;

  return {
    ...match,
    club,
    court: match.courtId ? getCourt(match.courtId) : undefined,
    organizer,
    players: match.playerIds
      .map((id) => getPlayer(id))
      .filter((p): p is Player => Boolean(p)),
    spotsLeft: spotsLeft(match),
    distanceKm: origin
      ? distanceKm(origin, { lat: club.location.lat, lng: club.location.lng })
      : null,
  };
}

export function listMatches(query: Partial<MatchQuery> = {}): Paged<MatchView> {
  const {
    city,
    category,
    gender,
    levelMin,
    levelMax,
    lat,
    lng,
    radiusKm = 25,
    date,
    onlyOpen,
    limit = 20,
    offset = 0,
  } = query;

  const origin =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  let views = db.matches
    .map((m) => toMatchView(m, origin))
    .filter((v): v is MatchView => Boolean(v));

  // Past matches never belong in a "find a game" listing.
  const now = Date.now();
  views = views.filter(
    (v) => new Date(v.startsAt).getTime() > now - 2 * 60 * 60 * 1000,
  );

  if (city) {
    views = views.filter(
      (v) => v.club.location.city.toLowerCase() === city.toLowerCase(),
    );
  }
  if (category) views = views.filter((v) => v.category === category);
  if (gender) views = views.filter((v) => v.gender === gender);

  // Level filters compare windows, so a 4.0 player sees any match whose
  // accepted range contains 4.0 rather than only matches labelled exactly 4.0.
  if (typeof levelMin === "number") {
    views = views.filter((v) => v.levelMax >= levelMin);
  }
  if (typeof levelMax === "number") {
    views = views.filter((v) => v.levelMin <= levelMax);
  }

  if (date) {
    const target = new Date(date);
    views = views.filter((v) => {
      const d = new Date(v.startsAt);
      return (
        d.getFullYear() === target.getFullYear() &&
        d.getMonth() === target.getMonth() &&
        d.getDate() === target.getDate()
      );
    });
  }

  if (onlyOpen) {
    views = views.filter((v) => v.spotsLeft > 0 && v.status === "abierto");
  }

  if (origin) {
    views = views.filter(
      (v) => v.distanceKm !== null && v.distanceKm <= radiusKm,
    );
    views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    views.sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  }

  return paginate(views, limit, offset);
}

export function getMatch(id: string): MatchView | null {
  const match = db.matches.find((m) => m.id === id);
  return match ? toMatchView(match, null) : null;
}

export function createMatch(input: CreateMatchInput): MatchView | null {
  const match: OpenMatch = {
    ...input,
    id: nextId("match"),
    playerIds: input.playerIds.length ? input.playerIds : [input.organizerId],
    status: "abierto",
    createdAt: new Date().toISOString(),
  };
  db.matches.unshift(match);
  persist();
  return toMatchView(match, null);
}

export type JoinResult =
  | { ok: true; match: MatchView }
  | { ok: false; reason: string };

export function joinMatch(matchId: string, playerId: string): JoinResult {
  const match = db.matches.find((m) => m.id === matchId);
  if (!match) return { ok: false, reason: "El partido no existe." };

  const player = getPlayer(playerId);
  if (!player) return { ok: false, reason: "El jugador no existe." };

  if (match.status === "cancelado")
    return { ok: false, reason: "El partido está cancelado." };
  if (match.playerIds.includes(playerId))
    return { ok: false, reason: "Ya estás apuntado a este partido." };
  if (spotsLeft(match) <= 0)
    return { ok: false, reason: "El partido ya está completo." };
  if (player.level < match.levelMin || player.level > match.levelMax)
    return {
      ok: false,
      reason: `Este partido acepta nivel ${match.levelMin} a ${match.levelMax}.`,
    };
  if (!genderAllows(match.gender, player.gender))
    return {
      ok: false,
      reason: `Este partido es ${GENDER_LABEL[match.gender].toLowerCase()}.`,
    };

  match.playerIds.push(playerId);
  if (spotsLeft(match) === 0) match.status = "completo";
  persist();

  return { ok: true, match: toMatchView(match, null)! };
}

export function leaveMatch(matchId: string, playerId: string): JoinResult {
  const match = db.matches.find((m) => m.id === matchId);
  if (!match) return { ok: false, reason: "El partido no existe." };
  if (match.organizerId === playerId)
    return {
      ok: false,
      reason: "Quien organiza no puede salirse. Cancela el partido.",
    };

  const index = match.playerIds.indexOf(playerId);
  if (index === -1) return { ok: false, reason: "No estabas apuntado." };

  match.playerIds.splice(index, 1);
  if (match.status === "completo") match.status = "abierto";
  persist();

  return { ok: true, match: toMatchView(match, null)! };
}

/* -------------------------------------------------------------- club views */

export type ClubView = Club & {
  courts: Court[];
  indoorCourts: number;
  openMatches: number;
  upcomingTournaments: number;
  priceFrom: number | null;
  distanceKm: number | null;
};

function toClubView(
  club: Club,
  origin: { lat: number; lng: number } | null,
): ClubView {
  const clubCourts = db.courts.filter((c) => c.clubId === club.id && c.active);
  const now = Date.now();

  return {
    ...club,
    courts: clubCourts,
    indoorCourts: clubCourts.filter((c) => c.indoor).length,
    openMatches: db.matches.filter(
      (m) =>
        m.clubId === club.id &&
        m.status === "abierto" &&
        new Date(m.startsAt).getTime() > now,
    ).length,
    upcomingTournaments: db.tournaments.filter(
      (t) =>
        t.clubId === club.id &&
        new Date(t.endsAt).getTime() > now &&
        t.status !== "cancelado" &&
        t.status !== "borrador",
    ).length,
    priceFrom: clubCourts.length
      ? Math.min(...clubCourts.map((c) => c.pricePerSlot))
      : null,
    distanceKm: origin
      ? distanceKm(origin, { lat: club.location.lat, lng: club.location.lng })
      : null,
  };
}

export function listClubs(query: Partial<ClubQuery> = {}): Paged<ClubView> {
  const {
    city,
    q,
    affiliated,
    indoor,
    lat,
    lng,
    radiusKm = 25,
    limit = 20,
    offset = 0,
  } = query;

  const origin =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  let views = db.clubs.map((c) => toClubView(c, origin));

  if (city) {
    views = views.filter(
      (v) => v.location.city.toLowerCase() === city.toLowerCase(),
    );
  }
  if (q) {
    const needle = q.toLowerCase();
    views = views.filter(
      (v) =>
        v.name.toLowerCase().includes(needle) ||
        v.location.city.toLowerCase().includes(needle) ||
        (v.location.neighbourhood ?? "").toLowerCase().includes(needle),
    );
  }
  if (typeof affiliated === "boolean") {
    views = views.filter((v) => v.affiliated === affiliated);
  }
  if (indoor) {
    views = views.filter((v) => v.indoorCourts > 0);
  }

  if (origin) {
    views = views.filter(
      (v) => v.distanceKm !== null && v.distanceKm <= radiusKm,
    );
    views.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  } else {
    views.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  return paginate(views, limit, offset);
}

export function getClubView(slug: string): ClubView | null {
  const club = getClubBySlug(slug);
  return club ? toClubView(club, null) : null;
}

/* -------------------------------------------------------- tournament views */

export type DrawView = TournamentDraw & {
  teams: Team[];
  registeredTeams: number;
  spotsLeft: number;
};

export type TournamentView = Tournament & {
  club: Club;
  draws: DrawView[];
  totalTeams: number;
  totalSpotsLeft: number;
  categories: CategoryTier[];
  distanceKm: number | null;
};

function toDrawView(draw: TournamentDraw): DrawView {
  const drawTeams = db.teams.filter((t) => t.drawId === draw.id);
  return {
    ...draw,
    teams: drawTeams,
    registeredTeams: drawTeams.length,
    spotsLeft: Math.max(0, draw.maxTeams - drawTeams.length),
  };
}

function toTournamentView(
  tournament: Tournament,
  origin: { lat: number; lng: number } | null,
): TournamentView | null {
  const club = getClub(tournament.clubId);
  if (!club) return null;

  const drawViews = db.draws
    .filter((d) => d.tournamentId === tournament.id)
    .map(toDrawView);

  return {
    ...tournament,
    club,
    draws: drawViews,
    totalTeams: drawViews.reduce((sum, d) => sum + d.registeredTeams, 0),
    totalSpotsLeft: drawViews.reduce((sum, d) => sum + d.spotsLeft, 0),
    categories: [
      ...new Set(drawViews.map((d) => d.category)),
    ].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
    ),
    distanceKm: origin
      ? distanceKm(origin, { lat: club.location.lat, lng: club.location.lng })
      : null,
  };
}

export function listTournaments(
  query: Partial<TournamentQuery> = {},
): Paged<TournamentView> {
  const {
    city,
    clubId,
    category,
    gender,
    status,
    lat,
    lng,
    radiusKm = 50,
    limit = 20,
    offset = 0,
  } = query;

  const origin =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  let views = db.tournaments
    .map((t) => toTournamentView(t, origin))
    .filter((v): v is TournamentView => Boolean(v))
    // Drafts are club-internal and never surface in public listings.
    .filter((v) => v.status !== "borrador");

  if (city) {
    views = views.filter(
      (v) => v.club.location.city.toLowerCase() === city.toLowerCase(),
    );
  }
  if (clubId) views = views.filter((v) => v.clubId === clubId);
  if (status) views = views.filter((v) => v.status === status);
  if (category) {
    views = views.filter((v) => v.draws.some((d) => d.category === category));
  }
  if (gender) {
    views = views.filter((v) => v.draws.some((d) => d.gender === gender));
  }

  if (origin) {
    views = views.filter(
      (v) => v.distanceKm !== null && v.distanceKm <= radiusKm,
    );
  }

  views.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return paginate(views, limit, offset);
}

export function getTournament(slug: string): TournamentView | null {
  const tournament = db.tournaments.find((t) => t.slug === slug);
  return tournament ? toTournamentView(tournament, null) : null;
}

export function getTournamentById(id: string): TournamentView | null {
  const tournament = db.tournaments.find((t) => t.id === id);
  return tournament ? toTournamentView(tournament, null) : null;
}

export function getTeam(id: string): Team | undefined {
  return db.teams.find((t) => t.id === id);
}

export function teamLabel(team: Team | undefined | null): string {
  if (!team) return "Por definir";
  if (team.name) return team.name;
  const names = team.playerIds
    .map((id) => getPlayer(id)?.name.split(" ")[0])
    .filter(Boolean);
  return names.join(" / ") || "Pareja";
}

/* ------------------------------------------------------------- the bracket */

export type BracketMatchView = BracketMatch & {
  teamA: Team | null;
  teamB: Team | null;
  teamALabel: string;
  teamBLabel: string;
  court?: Court;
};

export function getBracket(drawId: string): BracketMatchView[] {
  return db.bracket
    .filter((m) => m.drawId === drawId)
    .sort((a, b) => b.round - a.round || a.position - b.position)
    .map((m) => {
      const teamA = m.teamAId ? (getTeam(m.teamAId) ?? null) : null;
      const teamB = m.teamBId ? (getTeam(m.teamBId) ?? null) : null;
      return {
        ...m,
        teamA,
        teamB,
        teamALabel: teamLabel(teamA),
        teamBLabel: teamLabel(teamB),
        court: m.courtId ? getCourt(m.courtId) : undefined,
      };
    });
}

/** Group a draw's matches by round, ordered from first played to the final. */
export function bracketByRound(drawId: string): BracketMatchView[][] {
  const matches = getBracket(drawId);
  if (!matches.length) return [];

  const maxRound = Math.max(...matches.map((m) => m.round));
  const rounds: BracketMatchView[][] = [];

  for (let r = maxRound; r >= 0; r--) {
    rounds.push(
      matches
        .filter((m) => m.round === r)
        .sort((a, b) => a.position - b.position),
    );
  }
  return rounds;
}

export type ScoreResult =
  | { ok: true; match: BracketMatch }
  | { ok: false; reason: string };

/**
 * Record a result and advance the winner. Padel is best of three, so a winner
 * needs two sets. Advancing here rather than in the UI keeps the bracket
 * consistent no matter which surface reports the score.
 */
export function recordResult(
  matchId: string,
  sets: SetScore[],
  explicitWinnerId?: string,
): ScoreResult {
  const match = db.bracket.find((m) => m.id === matchId);
  if (!match) return { ok: false, reason: "El partido no existe." };
  if (!match.teamAId || !match.teamBId)
    return { ok: false, reason: "El cruce todavía no tiene las dos parejas." };

  let winner = explicitWinnerId ?? null;

  if (!winner) {
    const setsA = sets.filter((s) => s.a > s.b).length;
    const setsB = sets.filter((s) => s.b > s.a).length;
    if (setsA === setsB)
      return {
        ok: false,
        reason: "El resultado está empatado, indica quién pasa.",
      };
    winner = setsA > setsB ? match.teamAId : match.teamBId;
  }

  if (winner !== match.teamAId && winner !== match.teamBId)
    return { ok: false, reason: "La pareja ganadora no juega este cruce." };

  match.sets = sets;
  match.winnerTeamId = winner;
  match.status = "finalizado";

  const next = db.bracket.find(
    (n) =>
      n.drawId === match.drawId &&
      n.round === match.round - 1 &&
      n.position === Math.floor(match.position / 2),
  );

  if (next) {
    if (match.position % 2 === 0) next.teamAId = winner;
    else next.teamBId = winner;
  }

  persist();
  return { ok: true, match };
}

/** Rebuild a draw's bracket from its current teams, seeding the top four. */
export function regenerateBracket(drawId: string): BracketMatchView[] {
  const draw = db.draws.find((d) => d.id === drawId);
  if (!draw) return [];

  const drawTeams = db.teams
    .filter((t) => t.drawId === drawId)
    .sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));

  // Remove the old bracket in place.
  for (let i = db.bracket.length - 1; i >= 0; i--) {
    if (db.bracket[i].drawId === drawId) db.bracket.splice(i, 1);
  }

  const size = Math.max(
    2,
    2 ** Math.ceil(Math.log2(Math.max(2, drawTeams.length))),
  );
  const rounds = Math.log2(size);
  const tournament = db.tournaments.find((t) => t.id === draw.tournamentId);
  const clubCourts = tournament
    ? db.courts.filter((c) => c.clubId === tournament.clubId)
    : [];

  for (let r = 0; r < rounds; r++) {
    const roundIndex = rounds - 1 - r;
    const games = size / 2 ** (r + 1);

    for (let pos = 0; pos < games; pos++) {
      const first = r === 0;
      db.bracket.push({
        id: nextId("bm"),
        drawId,
        tournamentId: draw.tournamentId,
        round: roundIndex,
        position: pos,
        teamAId: first ? (drawTeams[pos * 2]?.id ?? null) : null,
        teamBId: first ? (drawTeams[pos * 2 + 1]?.id ?? null) : null,
        sets: [],
        winnerTeamId: null,
        courtId: clubCourts[pos % Math.max(1, clubCourts.length)]?.id,
        status: "pendiente",
      });
    }
  }

  persist();
  return bracketByRound(drawId).flat();
}

/* ------------------------------------------------ tournament and team writes */

export function createTournament(
  input: CreateTournamentInput,
): TournamentView | null {
  const id = nextId("t");
  const baseSlug = slugify(input.name);
  const slug = db.tournaments.some((t) => t.slug === baseSlug)
    ? `${baseSlug}-${id.slice(-4)}`
    : baseSlug;

  const { draws: drawInputs, ...rest } = input;

  const tournament: Tournament = {
    ...rest,
    id,
    slug,
    createdAt: new Date().toISOString(),
  };
  db.tournaments.unshift(tournament);

  drawInputs.forEach((d) => {
    db.draws.push({ ...d, id: nextId("draw"), tournamentId: id });
  });

  persist();
  return toTournamentView(tournament, null);
}

export function updateTournament(
  id: string,
  patch: Partial<Tournament>,
): TournamentView | null {
  const tournament = db.tournaments.find((t) => t.id === id);
  if (!tournament) return null;
  Object.assign(tournament, patch);
  persist();
  return toTournamentView(tournament, null);
}

export type RegisterResult =
  | { ok: true; team: Team }
  | { ok: false; reason: string };

export function registerTeam(
  drawId: string,
  playerIds: [string, string],
  name?: string,
): RegisterResult {
  const draw = db.draws.find((d) => d.id === drawId);
  if (!draw) return { ok: false, reason: "El cuadro no existe." };

  const tournament = db.tournaments.find((t) => t.id === draw.tournamentId);
  if (!tournament) return { ok: false, reason: "El torneo no existe." };
  if (tournament.status !== "inscripcion-abierta")
    return { ok: false, reason: "La inscripción no está abierta." };

  const current = db.teams.filter((t) => t.drawId === drawId);
  const waitlisted = current.length >= draw.maxTeams;

  if (playerIds[0] === playerIds[1])
    return { ok: false, reason: "Una pareja necesita dos jugadores distintos." };

  const already = current.find((t) =>
    t.playerIds.some((id) => playerIds.includes(id)),
  );
  if (already)
    return { ok: false, reason: "Uno de los jugadores ya está inscrito." };

  // Derive the surname pairing the club would write on the draw sheet, so the
  // API never hands a client an unnamed team to label for itself.
  const derivedName =
    name ??
    playerIds
      .map((id) => {
        const parts = getPlayer(id)?.name.split(" ") ?? [];
        return parts[1] ?? parts[0];
      })
      .filter(Boolean)
      .join(" / ");

  const team: Team = {
    id: nextId("team"),
    drawId,
    tournamentId: draw.tournamentId,
    name: derivedName || undefined,
    playerIds,
    seed: null,
    registeredAt: new Date().toISOString(),
    paid: false,
  };

  db.teams.push(team);
  db.registrations.push({
    id: nextId("reg"),
    tournamentId: draw.tournamentId,
    drawId,
    teamId: team.id,
    status: waitlisted ? "lista-espera" : "pendiente",
    createdAt: team.registeredAt,
  });

  persist();
  return { ok: true, team };
}

export function removeTeam(teamId: string): boolean {
  const index = db.teams.findIndex((t) => t.id === teamId);
  if (index === -1) return false;

  db.teams.splice(index, 1);
  for (let i = db.registrations.length - 1; i >= 0; i--) {
    if (db.registrations[i].teamId === teamId) db.registrations.splice(i, 1);
  }
  // Clear the team out of any bracket slot it occupied.
  db.bracket.forEach((m) => {
    if (m.teamAId === teamId) m.teamAId = null;
    if (m.teamBId === teamId) m.teamBId = null;
    if (m.winnerTeamId === teamId) {
      m.winnerTeamId = null;
      m.status = "pendiente";
      m.sets = [];
    }
  });

  persist();
  return true;
}

/* ------------------------------------------------------------ club console */

/** Everything the club admin surface needs for one club, in one read. */
export function getClubConsole(clubId: string) {
  const club = getClub(clubId);
  if (!club) return null;

  const now = Date.now();
  const clubTournaments = db.tournaments
    .filter((t) => t.clubId === clubId)
    .map((t) => toTournamentView(t, null))
    .filter((t): t is TournamentView => Boolean(t))
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

  const clubMatches = db.matches
    .filter((m) => m.clubId === clubId)
    .map((m) => toMatchView(m, null))
    .filter((m): m is MatchView => Boolean(m))
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

  return {
    club,
    courts: db.courts.filter((c) => c.clubId === clubId),
    tournaments: clubTournaments,
    matches: clubMatches,
    upcomingMatches: clubMatches.filter(
      (m) => new Date(m.startsAt).getTime() > now,
    ),
    openMatches: clubMatches.filter(
      (m) => m.status === "abierto" && new Date(m.startsAt).getTime() > now,
    ),
    registeredTeams: db.teams.filter((t) =>
      clubTournaments.some((ct) => ct.id === t.tournamentId),
    ).length,
    revenueCommitted: db.teams
      .filter((t) => clubTournaments.some((ct) => ct.id === t.tournamentId))
      .reduce((sum, t) => {
        const draw = db.draws.find((d) => d.id === t.drawId);
        return sum + (draw?.feePerTeam ?? 0);
      }, 0),
  };
}

export type ClubConsole = NonNullable<ReturnType<typeof getClubConsole>>;

/* ------------------------------------------------------------- player views */

export function listPlayers(
  query: { city?: string; category?: CategoryTier; q?: string; limit?: number } = {},
): Player[] {
  const { city, category, q, limit = 50 } = query;
  let items = [...db.players];

  if (city) items = items.filter((p) => p.city.toLowerCase() === city.toLowerCase());
  if (category) items = items.filter((p) => p.category === category);
  if (q) {
    const needle = q.toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.handle.toLowerCase().includes(needle),
    );
  }

  return items.slice(0, limit);
}

/** Players sorted by proximity, used by the "gente cerca" surface. */
export function playersNear(
  origin: { lat: number; lng: number },
  radiusKm = 25,
  limit = 12,
) {
  return byProximity(db.players, origin)
    .filter((p) => p.distanceKm !== null && p.distanceKm <= radiusKm)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ totals */

/** Real counters for the landing. Derived, never hardcoded. */
export function platformTotals() {
  const now = Date.now();
  return {
    clubs: db.clubs.length,
    courts: db.courts.filter((c) => c.active).length,
    players: db.players.length,
    cities: listCities().length,
    openMatches: db.matches.filter(
      (m) => m.status === "abierto" && new Date(m.startsAt).getTime() > now,
    ).length,
    liveTournaments: db.tournaments.filter(
      (t) => t.status === "inscripcion-abierta" || t.status === "en-juego",
    ).length,
    prizePool: db.tournaments
      .filter((t) => t.status !== "finalizado" && t.status !== "cancelado")
      .reduce((sum, t) => sum + t.totalPrizePool, 0),
  };
}

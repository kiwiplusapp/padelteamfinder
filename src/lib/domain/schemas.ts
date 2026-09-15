import { z } from "zod";

/* ============================================================================
   PadelParty domain schemas.

   Zod is the single source of truth: types, API request validation and form
   validation all derive from these. When this moves to a real database the
   schemas stay and only the repository implementation changes.
   ========================================================================== */

/* ---------------------------------------------------------------- primitives */

export const Id = z.string().min(1);

/**
 * Competitive tier as used by Spanish and LatAm federations. First is the
 * strongest. Kept as a string union rather than a number so it never gets
 * accidentally compared or sorted as a quantity.
 */
export const CategoryTier = z.enum([
  "primera",
  "segunda",
  "tercera",
  "cuarta",
  "quinta",
  "iniciacion",
]);
export type CategoryTier = z.infer<typeof CategoryTier>;

export const CATEGORY_LABEL: Record<CategoryTier, string> = {
  primera: "1ª categoría",
  segunda: "2ª categoría",
  tercera: "3ª categoría",
  cuarta: "4ª categoría",
  quinta: "5ª categoría",
  iniciacion: "Iniciación",
};

/** Ordered strongest to weakest, for range filters and bracket seeding. */
export const CATEGORY_ORDER: CategoryTier[] = [
  "primera",
  "segunda",
  "tercera",
  "cuarta",
  "quinta",
  "iniciacion",
];

/** Continuous skill rating, the Playtomic-style 0 to 7 scale. */
export const SkillLevel = z.number().min(0).max(7);

export const Gender = z.enum(["masculino", "femenino", "mixto"]);
export type Gender = z.infer<typeof Gender>;

export const GENDER_LABEL: Record<Gender, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  mixto: "Mixto",
};

/** Court side preference. Padel players are strongly one or the other. */
export const CourtSide = z.enum(["drive", "reves", "indistinto"]);
export type CourtSide = z.infer<typeof CourtSide>;

export const SIDE_LABEL: Record<CourtSide, string> = {
  drive: "Drive",
  reves: "Revés",
  indistinto: "Indistinto",
};

export const GeoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const Location = z.object({
  address: z.string().min(1),
  neighbourhood: z.string().optional(),
  city: z.string().min(1),
  region: z.string().min(1),
  country: z.string().min(1).default("España"),
  postalCode: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
});
export type Location = z.infer<typeof Location>;

/* -------------------------------------------------------------------- player */

/** A person is masculino or femenino; "mixto" describes a match, not a player. */
export const PlayerGender = z.enum(["masculino", "femenino"]);
export type PlayerGender = z.infer<typeof PlayerGender>;

export const Player = z.object({
  id: Id,
  handle: z.string().min(2),
  name: z.string().min(2),
  avatar: z.string().optional(),
  gender: PlayerGender,
  level: SkillLevel,
  category: CategoryTier,
  side: CourtSide,
  city: z.string(),
  region: z.string(),
  lat: z.number(),
  lng: z.number(),
  bio: z.string().max(280).optional(),
  /** Matches played through the platform. Real counter, starts at zero. */
  matchesPlayed: z.number().int().min(0).default(0),
  /** Share of listed matches the player actually turned up to. */
  reliability: z.number().min(0).max(1).default(1),
  memberOfClubIds: z.array(Id).default([]),
  joinedAt: z.string().datetime(),
});
export type Player = z.infer<typeof Player>;

/* ---------------------------------------------------------------------- club */

export const ClubAmenity = z.enum([
  "vestuarios",
  "duchas",
  "parking",
  "bar",
  "tienda",
  "alquiler-palas",
  "escuela",
  "accesible",
]);
export type ClubAmenity = z.infer<typeof ClubAmenity>;

export const AMENITY_LABEL: Record<ClubAmenity, string> = {
  vestuarios: "Vestuarios",
  duchas: "Duchas",
  parking: "Parking",
  bar: "Bar",
  tienda: "Tienda",
  "alquiler-palas": "Alquiler de palas",
  escuela: "Escuela",
  accesible: "Accesible",
};

export const Club = z.object({
  id: Id,
  slug: z.string().min(1),
  name: z.string().min(2),
  logo: z.string().optional(),
  cover: z.string().optional(),
  location: Location,
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  amenities: z.array(ClubAmenity).default([]),
  /**
   * Affiliated clubs handle registration and payment inside PadelParty.
   * Unaffiliated ones are still listed, but their tournaments link out to
   * whatever the club already uses.
   */
  affiliated: z.boolean().default(false),
  openingHours: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type Club = z.infer<typeof Club>;

/* --------------------------------------------------------------------- court */

export const CourtSurface = z.enum(["cesped-artificial", "cemento", "moqueta"]);
export const CourtEnclosure = z.enum(["cristal", "muro", "mixto"]);

export const Court = z.object({
  id: Id,
  clubId: Id,
  name: z.string().min(1),
  indoor: z.boolean(),
  panoramic: z.boolean().default(false),
  surface: CourtSurface,
  enclosure: CourtEnclosure,
  /** Price for a 90 minute slot, the padel standard. */
  pricePerSlot: z.number().min(0),
  currency: z.string().default("EUR"),
  active: z.boolean().default(true),
});
export type Court = z.infer<typeof Court>;

/* ------------------------------------------------------- open match listings */

export const MatchStatus = z.enum([
  "abierto",
  "completo",
  "confirmado",
  "cancelado",
  "jugado",
]);
export type MatchStatus = z.infer<typeof MatchStatus>;

export const MATCH_STATUS_LABEL: Record<MatchStatus, string> = {
  abierto: "Faltan jugadores",
  completo: "Completo",
  confirmado: "Confirmado",
  cancelado: "Cancelado",
  jugado: "Jugado",
};

/**
 * An open match is the core object of the product: somebody has a court, or
 * wants one, and is missing players. Everything else on the platform exists to
 * get this filled.
 */
export const OpenMatch = z.object({
  id: Id,
  clubId: Id,
  courtId: Id.optional(),
  organizerId: Id,
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(30).max(240).default(90),
  gender: Gender,
  category: CategoryTier,
  /** Accepted skill window, so a 3.0 does not land in a 5.5 match. */
  levelMin: SkillLevel,
  levelMax: SkillLevel,
  /** How many seats are still open. Derived from players on write. */
  spotsTotal: z.number().int().min(1).max(4).default(4),
  playerIds: z.array(Id).default([]),
  /** Cost per player for the court, split evenly. */
  pricePerPlayer: z.number().min(0),
  currency: z.string().default("EUR"),
  status: MatchStatus.default("abierto"),
  notes: z.string().max(280).optional(),
  createdAt: z.string().datetime(),
});
export type OpenMatch = z.infer<typeof OpenMatch>;

/**
 * Whether a player may occupy a seat in a match of this gender. A mixed match
 * takes anyone; a gendered one takes only that gender. One definition, so the
 * listing filter, the join endpoint and the seed can never disagree.
 */
export function genderAllows(
  matchGender: Gender,
  playerGender: PlayerGender,
): boolean {
  return matchGender === "mixto" || matchGender === playerGender;
}

/** Seats still available. Single definition, used by API, UI and filters. */
export function spotsLeft(match: Pick<OpenMatch, "spotsTotal" | "playerIds">) {
  return Math.max(0, match.spotsTotal - match.playerIds.length);
}

/* ----------------------------------------------------------------- tournament */

export const TournamentFormat = z.enum([
  "eliminacion",
  "grupos-eliminacion",
  "round-robin",
  "americano",
]);
export type TournamentFormat = z.infer<typeof TournamentFormat>;

export const FORMAT_LABEL: Record<TournamentFormat, string> = {
  eliminacion: "Eliminación directa",
  "grupos-eliminacion": "Grupos y eliminatoria",
  "round-robin": "Todos contra todos",
  americano: "Americano",
};

export const TournamentStatus = z.enum([
  "borrador",
  "inscripcion-abierta",
  "inscripcion-cerrada",
  "en-juego",
  "finalizado",
  "cancelado",
]);
export type TournamentStatus = z.infer<typeof TournamentStatus>;

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  borrador: "Borrador",
  "inscripcion-abierta": "Inscripción abierta",
  "inscripcion-cerrada": "Inscripción cerrada",
  "en-juego": "En juego",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const Prize = z.object({
  /** 1 for champion, 2 for runner up, and so on. */
  position: z.number().int().min(1),
  label: z.string().min(1),
  /** Cash component, optional: many club tournaments pay in kind. */
  amount: z.number().min(0).optional(),
  currency: z.string().default("EUR"),
  /** Trophies, gear, vouchers. */
  inKind: z.string().optional(),
});
export type Prize = z.infer<typeof Prize>;

/**
 * A tournament runs several independent draws, one per category and gender.
 * Registration, seeding, brackets and prizes all hang off the draw, not the
 * tournament, which is what makes real club events work.
 */
export const TournamentDraw = z.object({
  id: Id,
  tournamentId: Id,
  name: z.string().min(1),
  category: CategoryTier,
  gender: Gender,
  format: TournamentFormat,
  maxTeams: z.number().int().min(2).max(128),
  feePerTeam: z.number().min(0),
  currency: z.string().default("EUR"),
  prizes: z.array(Prize).default([]),
});
export type TournamentDraw = z.infer<typeof TournamentDraw>;

export const Tournament = z.object({
  id: Id,
  slug: z.string().min(1),
  clubId: Id,
  name: z.string().min(2),
  summary: z.string().max(200),
  description: z.string().optional(),
  cover: z.string().optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  registrationClosesAt: z.string().datetime(),
  status: TournamentStatus.default("borrador"),
  /**
   * Affiliated clubs take registrations in-platform. Everyone else publishes
   * the event and links out, which is how unaffiliated clubs get listed
   * without forcing them to change their operation.
   */
  registrationMode: z.enum(["interna", "externa"]).default("interna"),
  externalUrl: z.string().url().optional(),
  totalPrizePool: z.number().min(0).default(0),
  currency: z.string().default("EUR"),
  createdAt: z.string().datetime(),
});
export type Tournament = z.infer<typeof Tournament>;

/* ----------------------------------------------------------- teams and draws */

export const Team = z.object({
  id: Id,
  drawId: Id,
  tournamentId: Id,
  name: z.string().optional(),
  playerIds: z.tuple([Id, Id]),
  /** Seed 1 is the top seed. Unseeded teams carry null. */
  seed: z.number().int().min(1).nullable().default(null),
  registeredAt: z.string().datetime(),
  paid: z.boolean().default(false),
});
export type Team = z.infer<typeof Team>;

/** One set within a match. Padel is best of three. */
export const SetScore = z.object({
  a: z.number().int().min(0),
  b: z.number().int().min(0),
  /** Tie-break points, only when the set reached 6-6. */
  tieBreak: z.tuple([z.number().int(), z.number().int()]).optional(),
});
export type SetScore = z.infer<typeof SetScore>;

export const BracketMatch = z.object({
  id: Id,
  drawId: Id,
  tournamentId: Id,
  /**
   * Round index counted from the final backwards: 0 is the final, 1 the semis,
   * 2 the quarters. This makes bracket geometry trivial to compute and keeps
   * the numbering stable when a draw grows.
   */
  round: z.number().int().min(0),
  /** Position within the round, top to bottom, zero based. */
  position: z.number().int().min(0),
  teamAId: Id.nullable().default(null),
  teamBId: Id.nullable().default(null),
  sets: z.array(SetScore).default([]),
  winnerTeamId: Id.nullable().default(null),
  courtId: Id.optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z
    .enum(["pendiente", "en-juego", "finalizado", "walkover"])
    .default("pendiente"),
});
export type BracketMatch = z.infer<typeof BracketMatch>;

export const ROUND_LABEL: Record<number, string> = {
  0: "Final",
  1: "Semifinales",
  2: "Cuartos de final",
  3: "Octavos de final",
  4: "Dieciseisavos",
  5: "Treintaidosavos",
};

export function roundLabel(round: number) {
  return ROUND_LABEL[round] ?? `Ronda ${round}`;
}

/* ------------------------------------------------------------- registrations */

export const RegistrationStatus = z.enum([
  "pendiente",
  "confirmada",
  "lista-espera",
  "cancelada",
]);
export type RegistrationStatus = z.infer<typeof RegistrationStatus>;

export const Registration = z.object({
  id: Id,
  tournamentId: Id,
  drawId: Id,
  teamId: Id,
  status: RegistrationStatus.default("pendiente"),
  createdAt: z.string().datetime(),
});
export type Registration = z.infer<typeof Registration>;

/* ------------------------------------------------------------ join a match */

export const JoinRequestStatus = z.enum([
  "pendiente",
  "aceptada",
  "rechazada",
  "retirada",
]);

export const JoinRequest = z.object({
  id: Id,
  matchId: Id,
  playerId: Id,
  message: z.string().max(200).optional(),
  status: JoinRequestStatus.default("pendiente"),
  createdAt: z.string().datetime(),
});
export type JoinRequest = z.infer<typeof JoinRequest>;

/* ------------------------------------------------- API input payload schemas */

/** Body accepted by POST /api/v1/matches. */
export const CreateMatchInput = OpenMatch.omit({
  id: true,
  createdAt: true,
  status: true,
  playerIds: true,
})
  .extend({
    organizerId: Id,
    playerIds: z.array(Id).max(4).default([]),
  })
  .refine((m) => m.levelMin <= m.levelMax, {
    message: "El nivel mínimo no puede superar al máximo.",
    path: ["levelMin"],
  });
export type CreateMatchInput = z.infer<typeof CreateMatchInput>;

/** Body accepted by POST /api/v1/tournaments. */
export const CreateTournamentInput = Tournament.omit({
  id: true,
  slug: true,
  createdAt: true,
})
  .extend({
    draws: z
      .array(TournamentDraw.omit({ id: true, tournamentId: true }))
      .min(1, "Un torneo necesita al menos un cuadro."),
  })
  .refine((t) => new Date(t.endsAt) >= new Date(t.startsAt), {
    message: "La fecha de fin no puede ser anterior al inicio.",
    path: ["endsAt"],
  })
  .refine(
    (t) => new Date(t.registrationClosesAt) <= new Date(t.startsAt),
    {
      message: "La inscripción debe cerrar antes de que empiece el torneo.",
      path: ["registrationClosesAt"],
    },
  );
export type CreateTournamentInput = z.infer<typeof CreateTournamentInput>;

/** Query accepted by GET /api/v1/matches. */
export const MatchQuery = z.object({
  city: z.string().optional(),
  category: CategoryTier.optional(),
  gender: Gender.optional(),
  levelMin: z.coerce.number().min(0).max(7).optional(),
  levelMax: z.coerce.number().min(0).max(7).optional(),
  /** Proximity search. Radius is ignored unless both coordinates are present. */
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(25),
  /** ISO date, matches on that calendar day. */
  date: z.string().optional(),
  onlyOpen: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type MatchQuery = z.infer<typeof MatchQuery>;

/** Query accepted by GET /api/v1/tournaments. */
export const TournamentQuery = z.object({
  city: z.string().optional(),
  clubId: Id.optional(),
  category: CategoryTier.optional(),
  gender: Gender.optional(),
  status: TournamentStatus.optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(50),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type TournamentQuery = z.infer<typeof TournamentQuery>;

/** Query accepted by GET /api/v1/clubs and /api/v1/courts. */
export const ClubQuery = z.object({
  city: z.string().optional(),
  q: z.string().optional(),
  affiliated: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  indoor: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(25),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ClubQuery = z.infer<typeof ClubQuery>;

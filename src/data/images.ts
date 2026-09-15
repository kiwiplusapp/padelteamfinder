/* ============================================================================
   Image manifest.

   Every photographic slot in the product is declared here with its subject and
   its intended aspect, so swapping placeholder photography for real club and
   player assets is a data change rather than a component change.

   Resolution order for a slot:
     1. `local`  a file committed under /public/img. Wins whenever present.
     2. `remote` an explicit URL (a club's own photo, a licensed shot).
     3. a seeded Picsum URL, which is stable per seed and loads offline-free.

   The seeds are descriptive on purpose: changing the seed changes the photo, so
   two clubs never share an image by accident.
   ========================================================================== */

export type ImageSlot = {
  /** Stable key used by components. */
  seed: string;
  /** What should eventually live here. Read this when sourcing real assets. */
  subject: string;
  width: number;
  height: number;
  /** Set once a real file exists at /public/img/... */
  local?: string;
  /** Set to use a specific licensed URL instead of the placeholder. */
  remote?: string;
};

/** Build the URL a slot should render. */
export function imageUrl(slot: ImageSlot): string {
  if (slot.local) return slot.local;
  if (slot.remote) return slot.remote;
  return `https://picsum.photos/seed/${slot.seed}/${slot.width}/${slot.height}`;
}

/** Convenience for slots declared inline. */
export function photo(
  seed: string,
  width: number,
  height: number,
  subject = "",
): ImageSlot {
  return { seed, subject, width, height };
}

/* -------------------------------------------------------------- club covers */

export const CLUB_COVERS: Record<string, ImageSlot> = {
  "club-chamartin": {
    seed: "padel-court-chamartin-madrid",
    subject: "Pistas panorámicas al atardecer, vista desde la grada.",
    width: 1200,
    height: 800,
  },
  "club-la-nave": {
    seed: "padel-indoor-warehouse-vallecas",
    subject: "Nave industrial reconvertida, pistas cubiertas con focos.",
    width: 1200,
    height: 800,
  },
  "club-set-point": {
    seed: "padel-club-poblenou-barcelona",
    subject: "Pistas exteriores con la fachada del club al fondo.",
    width: 1200,
    height: 800,
  },
  "club-gracia": {
    seed: "padel-gracia-barcelona-rooftop",
    subject: "Pista en azotea, edificios de Gràcia alrededor.",
    width: 1200,
    height: 800,
  },
  "club-turia": {
    seed: "padel-turia-valencia-center",
    subject: "Complejo con varias pistas y zona de bar.",
    width: 1200,
    height: 800,
  },
  "club-triana": {
    seed: "padel-triana-sevilla-club",
    subject: "Club de barrio, dos pistas y muro pintado.",
    width: 1200,
    height: 800,
  },
  "club-costa": {
    seed: "padel-malaga-beach-court-night",
    subject: "Pistas nocturnas junto al paseo marítimo.",
    width: 1200,
    height: 800,
  },
  "club-ebro": {
    seed: "padel-zaragoza-indoor-ebro",
    subject: "Pabellón cubierto, pistas con cristal completo.",
    width: 1200,
    height: 800,
  },
};

/* -------------------------------------------------------- tournament covers */

export const TOURNAMENT_COVERS: Record<string, ImageSlot> = {
  "open-chamartin-primavera": {
    seed: "padel-tournament-final-crowd",
    subject: "Final con grada llena, pista central.",
    width: 1400,
    height: 900,
  },
  "circuito-nave-indoor-etapa-3": {
    seed: "padel-indoor-night-match-lights",
    subject: "Partido bajo techo con iluminación artificial.",
    width: 1400,
    height: 900,
  },
  "set-point-mixto": {
    seed: "padel-mixed-doubles-celebration",
    subject: "Pareja mixta celebrando un punto.",
    width: 1400,
    height: 900,
  },
  "gran-premio-turia": {
    seed: "padel-trophy-prize-ceremony",
    subject: "Entrega de trofeos con los cuatro finalistas.",
    width: 1400,
    height: 900,
  },
  "costa-padel-verano": {
    seed: "padel-summer-night-beach-tournament",
    subject: "Torneo nocturno de verano, ambiente de playa.",
    width: 1400,
    height: 900,
  },
  "copa-triana": {
    seed: "padel-neighbourhood-club-tournament",
    subject: "Torneo de barrio, jugadores esperando su turno.",
    width: 1400,
    height: 900,
  },
  "ebro-invierno": {
    seed: "padel-winter-indoor-bracket-day",
    subject: "Jornada de eliminatorias en pista cubierta.",
    width: 1400,
    height: 900,
  },
};

/* ------------------------------------------------------- brand photography */

/**
 * The five supplied photographs.
 *
 * Each one has a fixed path under /public/img/brand/. Drop the file at that
 * path and the section starts using it on the next request; until then the
 * section composes without it rather than showing a hole. Nothing here falls
 * back to Picsum: these are specific shots, and a random landscape standing in
 * for a padel court reads worse than the photograph simply being absent.
 */
export const BRAND = {
  /** Wide, dark, empty court with a ball mid-air in a shaft of light. */
  courtNight: {
    seed: "brand-court-night",
    subject:
      "Pista de pádel vacía en penumbra, bola suspendida y haz de luz lateral. Horizontal, 16:9 o más ancha.",
    width: 1920,
    height: 1080,
    local: "/img/brand/court-night.jpg",
  },
  /** Two players touching paddles over the net. The product, in one frame. */
  paddleTouch: {
    seed: "brand-paddle-touch",
    subject:
      "Dos jugadores chocando las palas sobre la red, césped verde, exterior. Horizontal.",
    width: 1680,
    height: 945,
    local: "/img/brand/paddle-touch.jpg",
  },
  /** A player mid-celebration under stage lighting. */
  playerCelebration: {
    seed: "brand-player-celebration",
    subject:
      "Jugador celebrando, luz azul de grada al fondo, plano medio. Horizontal.",
    width: 1020,
    height: 580,
    local: "/img/brand/player-celebration.jpg",
  },
  /** Ball and racket against a dark green field. */
  ballRacket: {
    seed: "brand-ball-racket",
    subject: "Bola y pala sobre fondo verde oscuro, plano producto. Horizontal.",
    width: 1254,
    height: 707,
    local: "/img/brand/ball-racket.jpg",
  },
  /**
   * Balls by the net on blue turf.
   *
   * NOTE: the supplied copy carries a visible stock watermark. It is wired up
   * but deliberately not used on any surface yet, because shipping a watermark
   * is worse than shipping nothing. Replace it with a licensed copy and then
   * point a section at it.
   */
  courtBalls: {
    seed: "brand-court-balls",
    subject:
      "Bolas junto a la red sobre césped azul, plano cerrado. Vertical. Sustituir por una copia con licencia: la actual lleva marca de agua.",
    width: 600,
    height: 900,
    local: "/img/brand/court-balls.jpg",
  },
} satisfies Record<string, ImageSlot>;

/** Every brand slot, for the readiness check the hero and the README use. */
export const BRAND_SLOTS = Object.values(BRAND);

/* --------------------------------------------------------------- editorial */

/**
 * Optional cut-out player for the hero, on a transparent background. This is
 * the one asset a photograph cannot stand in for, so it stays optional: the
 * hero composes on the court photograph and the WebGL scene without it.
 */
export const HERO_CUTOUT: ImageSlot = {
  seed: "padel-hero-player-cutout",
  subject:
    "Jugador o jugadora recortado sobre fondo transparente, pala en guardia. PNG con alfa, 1400x1800 mínimo.",
  width: 1400,
  height: 1800,
  local: "/img/hero/player-cutout.png",
};

export const EDITORIAL: Record<string, ImageSlot> = {
  matchAction: {
    seed: "padel-volley-action-net",
    subject: "Volea en la red, momento de impacto.",
    width: 1200,
    height: 1500,
  },
  courtTexture: {
    seed: "padel-court-turf-texture-close",
    subject: "Textura de césped artificial y línea blanca, plano cenital.",
    width: 1600,
    height: 900,
  },
  clubhouse: {
    seed: "padel-clubhouse-people-talking",
    subject: "Gente charlando en el club después de jugar.",
    width: 1200,
    height: 900,
  },
  bracketDay: {
    seed: "padel-scoreboard-bracket-wall",
    subject: "Cuadro de torneo impreso colgado en la pared del club.",
    width: 1200,
    height: 900,
  },
};

/**
 * Slots still waiting on real assets. Surfaced in the README so sourcing
 * photography is a checklist rather than an archaeology exercise.
 */
export const PENDING_REAL_ASSETS = [
  HERO_CUTOUT,
  ...Object.values(EDITORIAL),
] as const;

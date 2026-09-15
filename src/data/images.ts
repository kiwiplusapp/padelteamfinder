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

/* --------------------------------------------------------------- editorial */

/**
 * The hero wants a cut-out player on a transparent background, which is the one
 * asset a stock photograph cannot stand in for. Until that file exists the hero
 * composition carries itself on type and the WebGL scene, and this slot simply
 * does not render. Drop a PNG at /public/img/hero/player-cutout.png to enable.
 */
export const HERO_CUTOUT: ImageSlot = {
  seed: "padel-hero-player-cutout",
  subject:
    "Jugador o jugadora recortado sobre fondo transparente, pala en guardia, luz dura lateral. PNG con alfa, 1400x1800 mínimo.",
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

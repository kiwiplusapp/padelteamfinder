import { genderAllows } from "@/lib/domain/schemas";
import type {
  BracketMatch,
  CategoryTier,
  Club,
  Court,
  Gender,
  OpenMatch,
  Player,
  Registration,
  Team,
  Tournament,
  TournamentDraw,
} from "@/lib/domain/schemas";

/* ============================================================================
   Seed dataset.

   Clubs and tournaments are hand authored because their names and details
   carry the product's credibility. Players, matches, teams and brackets are
   generated from a seeded PRNG so the dataset is large, varied and identical
   on every boot.

   Dates are computed relative to load time so the listings always show a
   plausible upcoming week rather than a frozen calendar.
   ========================================================================== */

/** Deterministic PRNG. Same seed, same dataset, every run. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260412);

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)];
}

function pickMany<T>(items: readonly T[], count: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i++) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
}

function intBetween(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Start of today, local time, as the anchor for every generated date. */
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

function atOffset(days: number, hour: number, minute = 0) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/* ------------------------------------------------------------------- clubs */

export const clubs: Club[] = [
  {
    id: "club-chamartin",
    slug: "padel-chamartin",
    name: "Pádel Chamartín",
    logo: "/img/clubs/chamartin-logo.svg",
    cover: "/img/clubs/chamartin.jpg",
    location: {
      address: "Calle de Uruguay 24",
      neighbourhood: "Chamartín",
      city: "Madrid",
      region: "Comunidad de Madrid",
      country: "España",
      postalCode: "28016",
      lat: 40.4602,
      lng: -3.6798,
    },
    phone: "+34 913 47 21 08",
    email: "reservas@padelchamartin.es",
    amenities: ["vestuarios", "duchas", "parking", "bar", "escuela"],
    affiliated: true,
    openingHours: "L a D, 08:00 a 23:30",
    createdAt: daysAgo(880),
  },
  {
    id: "club-la-nave",
    slug: "la-nave-indoor",
    name: "La Nave Indoor",
    logo: "/img/clubs/la-nave-logo.svg",
    cover: "/img/clubs/la-nave.jpg",
    location: {
      address: "Avenida de la Albufera 153",
      neighbourhood: "Puente de Vallecas",
      city: "Madrid",
      region: "Comunidad de Madrid",
      country: "España",
      postalCode: "28038",
      lat: 40.3859,
      lng: -3.6547,
    },
    phone: "+34 914 77 63 92",
    email: "hola@lanaveindoor.es",
    amenities: ["vestuarios", "duchas", "bar", "alquiler-palas", "accesible"],
    affiliated: true,
    openingHours: "L a D, 07:00 a 00:00",
    createdAt: daysAgo(610),
  },
  {
    id: "club-set-point",
    slug: "set-point-poblenou",
    name: "Set Point Poblenou",
    logo: "/img/clubs/set-point-logo.svg",
    cover: "/img/clubs/set-point.jpg",
    location: {
      address: "Carrer de Pallars 312",
      neighbourhood: "Poblenou",
      city: "Barcelona",
      region: "Cataluña",
      country: "España",
      postalCode: "08019",
      lat: 41.4045,
      lng: 2.1985,
    },
    phone: "+34 934 86 15 40",
    email: "info@setpointbcn.cat",
    amenities: ["vestuarios", "duchas", "parking", "tienda", "escuela"],
    affiliated: true,
    openingHours: "L a V, 08:00 a 23:00. S y D, 09:00 a 22:00",
    createdAt: daysAgo(1240),
  },
  {
    id: "club-gracia",
    slug: "padel-gracia",
    name: "Pádel Gràcia",
    logo: "/img/clubs/gracia-logo.svg",
    cover: "/img/clubs/gracia.jpg",
    location: {
      address: "Carrer de Bailèn 201",
      neighbourhood: "Gràcia",
      city: "Barcelona",
      region: "Cataluña",
      country: "España",
      postalCode: "08037",
      lat: 41.4021,
      lng: 2.1631,
    },
    phone: "+34 932 18 74 55",
    amenities: ["vestuarios", "bar", "alquiler-palas"],
    affiliated: false,
    website: "https://reservas.padelgracia.example",
    openingHours: "L a D, 09:00 a 22:30",
    createdAt: daysAgo(430),
  },
  {
    id: "club-turia",
    slug: "turia-padel-center",
    name: "Turia Pádel Center",
    logo: "/img/clubs/turia-logo.svg",
    cover: "/img/clubs/turia.jpg",
    location: {
      address: "Carrer de Sant Vicent Màrtir 188",
      neighbourhood: "L'Olivereta",
      city: "Valencia",
      region: "Comunidad Valenciana",
      country: "España",
      postalCode: "46007",
      lat: 39.4561,
      lng: -0.3889,
    },
    phone: "+34 963 22 90 17",
    email: "turia@turiapadel.es",
    amenities: ["vestuarios", "duchas", "parking", "bar", "escuela", "tienda"],
    affiliated: true,
    openingHours: "L a D, 08:00 a 23:00",
    createdAt: daysAgo(760),
  },
  {
    id: "club-triana",
    slug: "triana-padel",
    name: "Triana Pádel",
    logo: "/img/clubs/triana-logo.svg",
    cover: "/img/clubs/triana.jpg",
    location: {
      address: "Calle Evangelista 42",
      neighbourhood: "Triana",
      city: "Sevilla",
      region: "Andalucía",
      country: "España",
      postalCode: "41010",
      lat: 37.3806,
      lng: -6.0075,
    },
    phone: "+34 954 33 68 21",
    amenities: ["vestuarios", "duchas", "bar"],
    affiliated: false,
    website: "https://trianapadel.example/torneos",
    openingHours: "L a D, 09:00 a 23:00",
    createdAt: daysAgo(295),
  },
  {
    id: "club-costa",
    slug: "costa-padel-malaga",
    name: "Costa Pádel Málaga",
    logo: "/img/clubs/costa-logo.svg",
    cover: "/img/clubs/costa.jpg",
    location: {
      address: "Paseo Marítimo Antonio Machado 68",
      neighbourhood: "Huelin",
      city: "Málaga",
      region: "Andalucía",
      country: "España",
      postalCode: "29002",
      lat: 36.7086,
      lng: -4.4479,
    },
    phone: "+34 952 61 04 73",
    email: "club@costapadel.es",
    amenities: ["vestuarios", "duchas", "parking", "bar", "tienda", "escuela"],
    affiliated: true,
    openingHours: "L a D, 08:00 a 23:30",
    createdAt: daysAgo(520),
  },
  {
    id: "club-ebro",
    slug: "ebro-indoor",
    name: "Ebro Indoor",
    logo: "/img/clubs/ebro-logo.svg",
    cover: "/img/clubs/ebro.jpg",
    location: {
      address: "Calle de Pablo Ruiz Picasso 31",
      neighbourhood: "Actur",
      city: "Zaragoza",
      region: "Aragón",
      country: "España",
      postalCode: "50018",
      lat: 41.6708,
      lng: -0.8875,
    },
    phone: "+34 976 51 38 24",
    amenities: ["vestuarios", "duchas", "parking", "alquiler-palas", "accesible"],
    affiliated: true,
    openingHours: "L a D, 07:30 a 23:00",
    createdAt: daysAgo(180),
  },
];

/* ------------------------------------------------------------------ courts */

export const courts: Court[] = clubs.flatMap((club, clubIndex) => {
  const count = [6, 8, 5, 3, 7, 4, 6, 5][clubIndex];
  return Array.from({ length: count }, (_, i) => {
    const indoor = club.id === "club-la-nave" || club.id === "club-ebro" || i < 2;
    return {
      id: `${club.id}-court-${i + 1}`,
      clubId: club.id,
      name: `Pista ${i + 1}`,
      indoor,
      panoramic: i === 0 || (i === 3 && count > 5),
      surface: "cesped-artificial" as const,
      enclosure: i % 3 === 0 ? ("cristal" as const) : ("mixto" as const),
      pricePerSlot: indoor ? intBetween(24, 34) : intBetween(16, 26),
      currency: "EUR",
      active: true,
    };
  });
});

/* ----------------------------------------------------------------- players */

const PLAYER_NAMES = [
  "Mateo Arriaga",
  "Lucía Ferrer",
  "Nacho Beltrán",
  "Carla Otero",
  "Diego Sanchís",
  "Marina Quiroga",
  "Pablo Iriarte",
  "Sofía Lamas",
  "Álvaro Recalde",
  "Inés Cabral",
  "Bruno Salcedo",
  "Valentina Ocaña",
  "Javier Mendiola",
  "Rocío Estévez",
  "Tomás Belmonte",
  "Andrea Vilalta",
  "Gonzalo Puyol",
  "Elena Zubiría",
  "Martín Escalante",
  "Paula Cifuentes",
  "Hugo Arteaga",
  "Nerea Basterra",
  "Iván Colomer",
  "Claudia Redondo",
  "Sergio Mansilla",
  "Ainhoa Goitia",
  "Raúl Jordà",
  "Miriam Sastre",
  "Unai Etxeberria",
  "Lorena Prats",
  "Adrián Casals",
  "Beatriz Aguirre",
  "Óscar Villalba",
  "Cristina Ibarra",
  "Emilio Tejera",
  "Sandra Roldán",
] as const;

const BIOS = [
  "Juego casi siempre entre semana por la tarde. Busco partido regular.",
  "Vuelvo después de una lesión de hombro, sin prisa y sin dramas.",
  "Me mudé hace dos meses y todavía no tengo grupo fijo.",
  "Compito en liga los domingos, entre semana juego por diversión.",
  "Prefiero revés, saco plano y muy poca paciencia con la bandeja.",
  "Disponible a última hora casi cualquier día. Aviso si no puedo ir.",
  "Llevo dos años jugando. Quiero subir de categoría este año.",
  "Juego con quien sea mientras el partido esté igualado.",
] as const;

/** Map a continuous level to the tier a federation would assign. */
function tierForLevel(level: number): CategoryTier {
  if (level >= 6) return "primera";
  if (level >= 5.2) return "segunda";
  if (level >= 4.4) return "tercera";
  if (level >= 3.4) return "cuarta";
  if (level >= 2.4) return "quinta";
  return "iniciacion";
}

export const players: Player[] = PLAYER_NAMES.map((name, i) => {
  // Two consecutive names (one masculine, one feminine) share a club, which
  // keeps every roster mixed instead of in phase with the gender alternation.
  const club = clubs[Math.floor(i / 2) % clubs.length];
  const level = round1(2 + rand() * 4.6);
  const [first, last] = name.split(" ");
  // PLAYER_NAMES alternates masculine and feminine, so gender follows the
  // name: deriving it any other way would label Elena as masculino. The club
  // is what gets decoupled instead (see the assignment above), otherwise club
  // index and gender parity stay in phase and each club is single-gender.
  const gender: "masculino" | "femenino" =
    i % 2 === 0 ? "masculino" : "femenino";
  return {
    id: `player-${i + 1}`,
    handle: `${first.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}${last
      .slice(0, 3)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")}`,
    name,
    avatar: `/img/players/p${(i % 12) + 1}.jpg`,
    gender,
    level,
    category: tierForLevel(level),
    side: pick(["drive", "reves", "indistinto"] as const),
    city: club.location.city,
    region: club.location.region,
    lat: club.location.lat + (rand() - 0.5) * 0.06,
    lng: club.location.lng + (rand() - 0.5) * 0.06,
    bio: rand() > 0.35 ? pick(BIOS) : undefined,
    matchesPlayed: intBetween(0, 94),
    reliability: round1(0.72 + rand() * 0.28),
    memberOfClubIds: [club.id],
    joinedAt: daysAgo(intBetween(12, 700)),
  };
});

/* ------------------------------------------------------------ open matches */

const MATCH_NOTES = [
  "Pista ya reservada y pagada. Solo falta cerrar el cuarto.",
  "Nos falta uno para completar. Nivel parejo, sin competición.",
  "Partido de nivel medio. Si no puedes venir avisa con tiempo.",
  "Tenemos pista a las 20:00. Buscamos pareja para el revés.",
  "Se cayó uno del grupo esta mañana. Pista confirmada.",
  "Buscamos cuarto jugador, preferible que aguante el ritmo.",
  "Partido tranquilo para coger ritmo. Sin presión.",
  "Falta una jugadora para cerrar el mixto.",
] as const;

export const matches: OpenMatch[] = Array.from({ length: 34 }, (_, i) => {
  const club = clubs[i % clubs.length];
  const clubCourts = courts.filter((c) => c.clubId === club.id);
  const court = pick(clubCourts);
  const wanted: Gender = pick(["masculino", "femenino", "mixto"] as const);
  const inCity = players.filter((p) => p.city === club.location.city);
  const matching = inCity.filter((p) => genderAllows(wanted, p.gender));
  // A gendered listing a city cannot staff becomes mixto instead of shipping
  // a match whose own participants violate its rule.
  const gender: Gender = matching.length >= 2 ? wanted : "mixto";
  const eligible = matching.length >= 2 ? matching : inCity;
  const organizer = pick(eligible.length ? eligible : players);
  const level = organizer.level;

  // Most listings are missing exactly one player, which is the real world case.
  const joined = rand() > 0.28 ? 3 : intBetween(1, 2);
  const others = pickMany(
    eligible.filter((p) => p.id !== organizer.id),
    joined - 1,
  );

  const dayOffset = intBetween(0, 13);
  const hour = pick([9, 10, 11, 12, 17, 18, 19, 20, 21, 22]);

  return {
    id: `match-${i + 1}`,
    clubId: club.id,
    courtId: court?.id,
    organizerId: organizer.id,
    startsAt: atOffset(dayOffset, hour, pick([0, 30])),
    durationMinutes: pick([60, 90, 90, 90, 120]),
    gender,
    category: organizer.category,
    levelMin: round1(Math.max(0, level - 0.6)),
    levelMax: round1(Math.min(7, level + 0.6)),
    spotsTotal: 4,
    playerIds: [organizer.id, ...others.map((p) => p.id)],
    pricePerPlayer: round1((court?.pricePerSlot ?? 24) / 4),
    currency: "EUR",
    status: joined >= 4 ? "completo" : "abierto",
    notes: rand() > 0.3 ? pick(MATCH_NOTES) : undefined,
    createdAt: daysAgo(intBetween(0, 6)),
  };
});

/* --------------------------------------------------------------- tournaments */

type TournamentSeed = {
  id: string;
  slug: string;
  clubId: string;
  name: string;
  summary: string;
  description: string;
  startOffset: number;
  days: number;
  status: Tournament["status"];
  registrationMode: Tournament["registrationMode"];
  externalUrl?: string;
  prizePool: number;
  draws: Array<{
    name: string;
    category: CategoryTier;
    gender: Gender;
    format: TournamentDraw["format"];
    maxTeams: number;
    fee: number;
    prizes: TournamentDraw["prizes"];
  }>;
};

const TOURNAMENT_SEEDS: TournamentSeed[] = [
  {
    id: "t-chamartin-primavera",
    slug: "open-chamartin-primavera",
    clubId: "club-chamartin",
    name: "Open Chamartín de Primavera",
    summary:
      "Tres días de competición con cuadros masculino, femenino y mixto.",
    description:
      "El torneo de referencia del club desde 2019. Se juega a partido único desde octavos, con bola Head Padel Pro y pistas panorámicas. La organización reserva dos pistas para calentamiento durante toda la jornada.",
    startOffset: 12,
    days: 3,
    status: "inscripcion-abierta",
    registrationMode: "interna",
    prizePool: 3200,
    draws: [
      {
        name: "Masculino 2ª",
        category: "segunda",
        gender: "masculino",
        format: "eliminacion",
        maxTeams: 16,
        fee: 40,
        prizes: [
          { position: 1, label: "Campeones", amount: 900, currency: "EUR", inKind: "Dos palas Nox AT10" },
          { position: 2, label: "Finalistas", amount: 450, currency: "EUR" },
          { position: 3, label: "Semifinalistas", amount: 0, currency: "EUR", inKind: "Paletero y material" },
        ],
      },
      {
        name: "Femenino 3ª",
        category: "tercera",
        gender: "femenino",
        format: "eliminacion",
        maxTeams: 8,
        fee: 36,
        prizes: [
          { position: 1, label: "Campeonas", amount: 600, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 300, currency: "EUR" },
        ],
      },
      {
        name: "Mixto 4ª",
        category: "cuarta",
        gender: "mixto",
        format: "grupos-eliminacion",
        maxTeams: 16,
        fee: 30,
        prizes: [
          { position: 1, label: "Campeones", amount: 400, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 200, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-nave-circuito",
    slug: "circuito-nave-indoor-etapa-3",
    clubId: "club-la-nave",
    name: "Circuito Nave Indoor, etapa 3",
    summary: "Tercera parada del circuito de invierno. Se juega bajo techo.",
    description:
      "Puntúa para la clasificación general del circuito. Las ocho mejores parejas de cada categoría acceden al máster de junio. Pista cubierta, así que el torneo se juega llueva o no.",
    startOffset: 5,
    days: 2,
    status: "inscripcion-abierta",
    registrationMode: "interna",
    prizePool: 1800,
    draws: [
      {
        name: "Masculino 3ª",
        category: "tercera",
        gender: "masculino",
        format: "eliminacion",
        maxTeams: 16,
        fee: 32,
        prizes: [
          { position: 1, label: "Campeones", amount: 500, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 250, currency: "EUR" },
        ],
      },
      {
        name: "Mixto 3ª",
        category: "tercera",
        gender: "mixto",
        format: "eliminacion",
        maxTeams: 8,
        fee: 32,
        prizes: [
          { position: 1, label: "Campeones", amount: 400, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 200, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-setpoint-mixto",
    slug: "set-point-mixto",
    clubId: "club-set-point",
    name: "Set Point Mixto",
    summary: "Formato americano por la mañana y eliminatoria por la tarde.",
    description:
      "Pensado para parejas que se forman el mismo día. Por la mañana se juega americano para repartir niveles y por la tarde se cruzan las eliminatorias. Comida incluida en la inscripción.",
    startOffset: 21,
    days: 1,
    status: "inscripcion-abierta",
    registrationMode: "interna",
    prizePool: 900,
    draws: [
      {
        name: "Mixto 4ª",
        category: "cuarta",
        gender: "mixto",
        format: "americano",
        maxTeams: 16,
        fee: 28,
        prizes: [
          { position: 1, label: "Campeones", amount: 300, currency: "EUR", inKind: "Vale de 150 EUR en tienda" },
          { position: 2, label: "Finalistas", amount: 150, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-turia-gran-premio",
    slug: "gran-premio-turia",
    clubId: "club-turia",
    name: "Gran Premio Turia",
    summary: "El cuadro de primera reparte el bote más alto de la temporada.",
    description:
      "Cuadro de primera con parejas federadas y cuadro paralelo de cuarta para socios del club. La final se juega en la pista central con grada montada.",
    startOffset: 34,
    days: 4,
    status: "inscripcion-abierta",
    registrationMode: "interna",
    prizePool: 6500,
    draws: [
      {
        name: "Masculino 1ª",
        category: "primera",
        gender: "masculino",
        format: "eliminacion",
        maxTeams: 16,
        fee: 60,
        prizes: [
          { position: 1, label: "Campeones", amount: 2200, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 1100, currency: "EUR" },
          { position: 3, label: "Semifinalistas", amount: 400, currency: "EUR" },
        ],
      },
      {
        name: "Femenino 2ª",
        category: "segunda",
        gender: "femenino",
        format: "eliminacion",
        maxTeams: 8,
        fee: 50,
        prizes: [
          { position: 1, label: "Campeonas", amount: 1200, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 600, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-costa-summer",
    slug: "costa-padel-verano",
    clubId: "club-costa",
    name: "Costa Pádel Verano",
    summary: "Torneo nocturno en pistas exteriores junto al paseo marítimo.",
    description:
      "Se juega de 19:00 a 01:00 para esquivar el calor. Ambiente de playa, música entre partidos y barra abierta hasta el final del cuadro.",
    startOffset: 48,
    days: 3,
    status: "inscripcion-abierta",
    registrationMode: "interna",
    prizePool: 2400,
    draws: [
      {
        name: "Masculino 3ª",
        category: "tercera",
        gender: "masculino",
        format: "grupos-eliminacion",
        maxTeams: 16,
        fee: 38,
        prizes: [
          { position: 1, label: "Campeones", amount: 800, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 400, currency: "EUR" },
        ],
      },
      {
        name: "Mixto 5ª",
        category: "quinta",
        gender: "mixto",
        format: "round-robin",
        maxTeams: 8,
        fee: 26,
        prizes: [
          { position: 1, label: "Campeones", amount: 250, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 120, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-triana-copa",
    slug: "copa-triana",
    clubId: "club-triana",
    name: "Copa Triana",
    summary: "Torneo del barrio. La inscripción se gestiona en la web del club.",
    description:
      "Triana Pádel todavía no gestiona inscripciones dentro de PadelParty, así que el cuadro se publica aquí y la inscripción se completa en su web. El club confirma las plazas por teléfono.",
    startOffset: 17,
    days: 2,
    status: "inscripcion-abierta",
    registrationMode: "externa",
    externalUrl: "https://trianapadel.example/torneos/copa-triana",
    prizePool: 700,
    draws: [
      {
        name: "Masculino 4ª",
        category: "cuarta",
        gender: "masculino",
        format: "eliminacion",
        maxTeams: 16,
        fee: 25,
        prizes: [
          { position: 1, label: "Campeones", amount: 300, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 150, currency: "EUR" },
        ],
      },
    ],
  },
  {
    id: "t-ebro-invierno",
    slug: "ebro-invierno",
    clubId: "club-ebro",
    name: "Ebro Invierno",
    summary: "Cuadro cerrado. Las eliminatorias ya están en juego.",
    description:
      "Torneo en curso. Los cruces de cuartos se juegan el sábado por la mañana y la final el domingo a mediodía.",
    startOffset: -2,
    days: 4,
    status: "en-juego",
    registrationMode: "interna",
    prizePool: 1500,
    draws: [
      {
        name: "Masculino 2ª",
        category: "segunda",
        gender: "masculino",
        format: "eliminacion",
        maxTeams: 8,
        fee: 35,
        prizes: [
          { position: 1, label: "Campeones", amount: 600, currency: "EUR" },
          { position: 2, label: "Finalistas", amount: 300, currency: "EUR" },
        ],
      },
    ],
  },
];

export const tournaments: Tournament[] = TOURNAMENT_SEEDS.map((t) => ({
  id: t.id,
  slug: t.slug,
  clubId: t.clubId,
  name: t.name,
  summary: t.summary,
  description: t.description,
  cover: `/img/tournaments/${t.slug}.jpg`,
  startsAt: atOffset(t.startOffset, 9),
  endsAt: atOffset(t.startOffset + t.days - 1, 21),
  registrationClosesAt: atOffset(Math.max(t.startOffset - 3, -1), 23, 59),
  status: t.status,
  registrationMode: t.registrationMode,
  externalUrl: t.externalUrl,
  totalPrizePool: t.prizePool,
  currency: "EUR",
  createdAt: daysAgo(intBetween(20, 120)),
}));

export const draws: TournamentDraw[] = TOURNAMENT_SEEDS.flatMap((t) =>
  t.draws.map((d, i) => ({
    id: `${t.id}-draw-${i + 1}`,
    tournamentId: t.id,
    name: d.name,
    category: d.category,
    gender: d.gender,
    format: d.format,
    maxTeams: d.maxTeams,
    feePerTeam: d.fee,
    currency: "EUR",
    prizes: d.prizes,
  })),
);

/* ------------------------------------------------- teams, brackets, entries */

const teams: Team[] = [];
const registrations: Registration[] = [];
const bracket: BracketMatch[] = [];

let teamCounter = 0;
let matchCounter = 0;

for (const draw of draws) {
  const tournament = tournaments.find((t) => t.id === draw.tournamentId)!;
  const club = clubs.find((c) => c.id === tournament.clubId)!;

  // Fill most of the draw but leave real space, so "quedan N plazas" is honest.
  const filled =
    tournament.status === "en-juego"
      ? draw.maxTeams
      : Math.max(2, draw.maxTeams - intBetween(1, Math.ceil(draw.maxTeams / 3)));

  // A player enters a given draw once. The pool depletes as pairs are formed,
  // so no name can appear on two teams in the same bracket.
  const men = players.filter((p) => p.gender === "masculino");
  const women = players.filter((p) => p.gender === "femenino");
  const pool =
    draw.gender === "masculino"
      ? [...men]
      : draw.gender === "femenino"
        ? [...women]
        : [...players];
  // A mixto pair is one of each, not two random people.
  const menPool = [...men];
  const womenPool = [...women];

  const take = (from: Player[]) =>
    from.splice(Math.floor(rand() * from.length), 1)[0];

  const drawTeams: Team[] = [];
  for (let i = 0; i < filled; i++) {
    let pair: Player[];
    if (draw.gender === "mixto") {
      if (!menPool.length || !womenPool.length) break;
      pair = [take(menPool), take(womenPool)];
    } else {
      if (pool.length < 2) break;
      pair = [take(pool), take(pool)];
    }
    if (pair.length < 2 || pair.some((x) => !x)) break;
    teamCounter += 1;
    const team: Team = {
      id: `team-${teamCounter}`,
      drawId: draw.id,
      tournamentId: draw.tournamentId,
      name: `${pair[0].name.split(" ")[1]} / ${pair[1].name.split(" ")[1]}`,
      playerIds: [pair[0].id, pair[1].id],
      seed: i < 4 ? i + 1 : null,
      registeredAt: daysAgo(intBetween(2, 30)),
      paid: rand() > 0.2,
    };
    drawTeams.push(team);
    teams.push(team);
    registrations.push({
      id: `reg-${teamCounter}`,
      tournamentId: draw.tournamentId,
      drawId: draw.id,
      teamId: team.id,
      status: team.paid ? "confirmada" : "pendiente",
      createdAt: team.registeredAt,
    });
  }

  // Build a power-of-two bracket around the registered teams.
  const size = Math.max(2, 2 ** Math.ceil(Math.log2(Math.max(2, drawTeams.length))));
  const rounds = Math.log2(size);
  const clubCourts = courts.filter((c) => c.clubId === club.id);

  for (let r = 0; r < rounds; r++) {
    // round index 0 is the final, so the first played round is rounds-1
    const roundIndex = rounds - 1 - r;
    const gamesInRound = size / 2 ** (r + 1);

    for (let pos = 0; pos < gamesInRound; pos++) {
      matchCounter += 1;
      const isFirstRound = r === 0;
      const teamA = isFirstRound ? (drawTeams[pos * 2] ?? null) : null;
      const teamB = isFirstRound ? (drawTeams[pos * 2 + 1] ?? null) : null;

      bracket.push({
        id: `bm-${matchCounter}`,
        drawId: draw.id,
        tournamentId: draw.tournamentId,
        round: roundIndex,
        position: pos,
        teamAId: teamA?.id ?? null,
        teamBId: teamB?.id ?? null,
        sets: [],
        winnerTeamId: null,
        courtId: clubCourts[pos % Math.max(1, clubCourts.length)]?.id,
        scheduledAt: atOffset(
          TOURNAMENT_SEEDS.find((s) => s.id === tournament.id)!.startOffset + r,
          10 + (pos % 6),
        ),
        status: "pendiente",
      });
    }
  }
}

/**
 * Play out the in-progress tournament so the bracket view has real scores to
 * render instead of an empty grid.
 */
function playOut(tournamentId: string, upToRound: number) {
  const drawsFor = draws.filter((d) => d.tournamentId === tournamentId);
  for (const draw of drawsFor) {
    const drawMatches = bracket.filter((m) => m.drawId === draw.id);
    const maxRound = Math.max(...drawMatches.map((m) => m.round));

    for (let r = maxRound; r >= upToRound; r--) {
      const inRound = drawMatches
        .filter((m) => m.round === r)
        .sort((a, b) => a.position - b.position);

      for (const m of inRound) {
        if (!m.teamAId || !m.teamBId) continue;
        const aWins = rand() > 0.5;
        const winner = aWins ? m.teamAId : m.teamBId;

        /** One set with a given winner, occasionally going to a tie-break. */
        const set = (winnerIsA: boolean) => {
          const tight = rand() > 0.78;
          if (tight) {
            const tbWin = intBetween(7, 10);
            const tbLose = tbWin - intBetween(2, 3);
            return {
              a: winnerIsA ? 7 : 6,
              b: winnerIsA ? 6 : 7,
              tieBreak: (winnerIsA
                ? [tbWin, tbLose]
                : [tbLose, tbWin]) as [number, number],
            };
          }
          const loser = intBetween(0, 4);
          return { a: winnerIsA ? 6 : loser, b: winnerIsA ? loser : 6 };
        };

        m.sets =
          rand() > 0.35
            ? [set(aWins), set(aWins)]
            : [set(!aWins), set(aWins), set(aWins)];
        m.winnerTeamId = winner;
        m.status = "finalizado";

        // Advance the winner into the next round's slot.
        const next = drawMatches.find(
          (n) => n.round === r - 1 && n.position === Math.floor(m.position / 2),
        );
        if (next) {
          if (m.position % 2 === 0) next.teamAId = winner;
          else next.teamBId = winner;
        }
      }
    }
  }
}

playOut("t-ebro-invierno", 1);

export { teams, registrations, bracket };

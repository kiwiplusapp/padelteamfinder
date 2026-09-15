# PadelParty

Encuentra con quién jugar al pádel: publica el partido al que te falta gente,
ocupa la plaza que otro deja libre y compite en los torneos de tu club.

Web construida con Next.js 16, React 19, TypeScript y Tailwind v4, con una API
REST pensada para que la futura app móvil consuma exactamente los mismos datos
que renderiza la web.

---

## Arrancar en local

```bash
npm install
npm run dev
```

La app queda en `http://localhost:3000`. No hace falta base de datos ni
variables de entorno: el repositorio arranca desde una semilla determinista.

```bash
npm run build && npm start   # build de producción
npx eslint src               # lint
npx tsc --noEmit             # typecheck
```

---

## Qué hay construido

**Para jugadores**

| Ruta | Qué hace |
|---|---|
| `/` | Landing con escena WebGL, datos en vivo y recorrido de scroll |
| `/partidos` | Listado con filtros de ciudad, categoría, género y distancia |
| `/partidos/[id]` | Detalle, quién va, plazas libres y ocupar plaza |
| `/partidos/publicar` | Publicar un partido al que falta gente |
| `/torneos` | Torneos filtrables por ciudad, categoría, género y estado |
| `/torneos/[slug]` | Cuadros, premios, llaves e inscripción |
| `/clubes` | Buscar club y pistas, ordenado por distancia real |
| `/clubes/[slug]` | Ficha del club, pistas, precios, partidos y torneos |
| `/para-clubes` | Qué obtiene un club al publicar aquí |

**Para clubes**

| Ruta | Qué hace |
|---|---|
| `/admin` | Consola del club: torneos, parejas, cuotas, plazas libres |
| `/admin/torneos/nuevo` | Crear torneo con varios cuadros, cuotas y premios |
| `/admin/torneos/[id]` | Gestionar cuadros, inscripciones, llaves y resultados |

---

## API v1

Todas las respuestas usan un sobre único, para que un cliente móvil escriba un
solo decodificador y una sola ruta de error:

```jsonc
{ "data": [ /* ... */ ], "meta": { "total": 34, "limit": 20, "offset": 0 } }
{ "error": { "code": "rule_violation", "message": "El partido ya está completo." } }
```

Los códigos (`bad_request`, `validation_failed`, `not_found`, `conflict`,
`rule_violation`, `server_error`) son cadenas estables: el cliente ramifica por
código, no parseando el mensaje.

| Método y ruta | Para qué |
|---|---|
| `GET /api/v1/meta` | Vocabulario de filtros y contadores en vivo |
| `GET /api/v1/matches` | Partidos abiertos. Filtros de ciudad, categoría, género, nivel, fecha y `lat`/`lng`/`radiusKm` |
| `POST /api/v1/matches` | Publicar un partido |
| `GET /api/v1/matches/:id` | Detalle |
| `POST /api/v1/matches/:id/join` | Ocupar plaza. Valida aforo, ventana de nivel y género |
| `DELETE /api/v1/matches/:id/join` | Dejar la plaza |
| `GET /api/v1/tournaments` | Torneos públicos con sus cuadros y plazas |
| `POST /api/v1/tournaments` | Crear torneo con uno o más cuadros |
| `GET /api/v1/tournaments/:slug` | Detalle |
| `POST /api/v1/draws/:drawId/teams` | Inscribir pareja. Pasa a lista de espera si el cuadro está lleno |
| `GET /api/v1/draws/:drawId/bracket` | Llaves por rondas, de primera ronda a final |
| `PATCH /api/v1/draws/:drawId/bracket` | Registrar resultado. El ganador avanza en el servidor |
| `POST /api/v1/draws/:drawId/bracket` | Regenerar el cuadro desde las parejas inscritas |
| `GET /api/v1/clubs` · `GET /api/v1/clubs/:slug` | Clubes, con distancia si envías coordenadas |
| `GET /api/v1/courts` | Pistas en plano, con su club |
| `GET /api/v1/players` | Directorio, o jugadores cercanos con `lat`/`lng` |

Ejemplo:

```bash
curl "http://localhost:3000/api/v1/matches?lat=40.4168&lng=-3.7038&radiusKm=10&onlyOpen=true"
```

---

## Arquitectura

```
src/
  app/
    (product)/        superficies de jugador, con nav y tab bar móvil
    admin/            consola de club, más densa a propósito
    api/v1/           API REST versionada
  components/
    marketing/        secciones del landing
    app/              componentes de producto reutilizables
    three/            escena WebGL, aislada como leaf client
    ui/               primitivas: botón, badge, avatar, campo, estados
  lib/
    domain/
      schemas.ts      Zod como única fuente de verdad
      repo.ts         todas las consultas y mutaciones
      db.ts           snapshot en memoria, persistido a .data/db.json
    geo.ts            haversine y orden por proximidad
    api.ts            sobre de respuesta y parseo validado
  data/
    seed.ts           semilla determinista
    images.ts         manifiesto de huecos fotográficos
```

**Capa de datos.** Zod define los tipos, valida la entrada de la API y valida
los formularios. El repositorio devuelve vistas ya enriquecidas (club,
organizador, distancia, contadores derivados), así que la web y la app móvil
reciben la misma forma. El almacenamiento es un snapshot en memoria que se
persiste a `.data/db.json`.

Prisma y `better-sqlite3` no se instalaron porque en este entorno `prisma`
resuelve a un release candidate inestable y los paquetes nativos no compilan.
Pasar a Postgres significa reimplementar `src/lib/domain/repo.ts`: ni los
esquemas ni las páginas ni la API cambian.

**Reglas en un solo sitio.** Aforo, ventana de nivel y compatibilidad de género
viven en el dominio, no en la UI. El avance del ganador en una llave lo decide
el servidor, no el navegador, para que el cuadro no dependa de lo que envíe un
cliente.

---

## Sistema de diseño

Cobalto profundo como campo, **un solo acento** (volt lima) en todo el producto.
Dos radios y nada entre medias: píldora completa para lo interactivo, 2px para
superficies. Un único tema en todo el sitio, sin secciones que se inviertan a
mitad de scroll. Tokens en `src/app/globals.css`.

Tipografía: Anton para display, Archivo para interfaz, JetBrains Mono para
cifras con figuras tabulares.

Movimiento: Motion para revelados de scroll, GSAP solo donde hace falta fijar y
recorrer (las llaves del landing), Three.js aislado en su propio leaf. Las tres
librerías nunca comparten árbol de componentes. Todo degrada a estático bajo
`prefers-reduced-motion`.

---

## Pendiente

- **Fotografía real.** `src/data/images.ts` declara cada hueco con su tema y su
  proporción. Mientras no haya archivos en `/public/img`, cada hueco cae a una
  foto estable de Picsum por semilla. El hueco del hero
  (`/public/img/hero/player-cutout.png`, jugador recortado sobre fondo
  transparente) es el único que una foto de stock no puede sustituir.
- **Autenticación.** No hay cuentas. La identidad se elige en un selector y se
  guarda en `localStorage` (`src/lib/use-current-player.ts`). Todos los
  endpoints de escritura ya reciben un `playerId` explícito, así que conectar
  sesiones reales toca ese hook y nada más.
- **Pagos.** Las cuotas se registran como comprometidas o pendientes, sin cobro.
- **Notificaciones.** Cuando alguien ocupa tu plaza o tu pareja se cae.

import { ok, parseQuery } from "@/lib/api";
import { listClubs } from "@/lib/domain/repo";
import { ClubQuery } from "@/lib/domain/schemas";

/**
 * GET /api/v1/courts
 * A flat court list with its club attached, which is the shape a booking
 * screen wants. Accepts the same filters as /clubs.
 */
export async function GET(request: Request) {
  const query = parseQuery(request.url, ClubQuery);
  if (!query.ok) return query.response;

  const clubs = listClubs({ ...query.value, limit: 100, offset: 0 });

  const courts = clubs.items.flatMap((club) =>
    club.courts
      .filter((court) => (query.value.indoor ? court.indoor : true))
      .map((court) => ({
        ...court,
        club: {
          id: club.id,
          slug: club.slug,
          name: club.name,
          city: club.location.city,
          lat: club.location.lat,
          lng: club.location.lng,
        },
        distanceKm: club.distanceKm,
      })),
  );

  const { limit, offset } = query.value;
  return ok(courts.slice(offset, offset + limit), {
    total: courts.length,
    limit,
    offset,
  });
}

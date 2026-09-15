import { ok, parseQuery } from "@/lib/api";
import { listPlayers, playersNear } from "@/lib/domain/repo";
import { CategoryTier } from "@/lib/domain/schemas";
import { z } from "zod";

const Query = z.object({
  city: z.string().optional(),
  category: CategoryTier.optional(),
  q: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(200).default(25),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** GET /api/v1/players - directory, or nearby players when given coordinates. */
export async function GET(request: Request) {
  const query = parseQuery(request.url, Query);
  if (!query.ok) return query.response;

  const { lat, lng, radiusKm, limit, ...rest } = query.value;

  if (typeof lat === "number" && typeof lng === "number") {
    const near = playersNear({ lat, lng }, radiusKm, limit);
    return ok(near, { total: near.length, limit, offset: 0 });
  }

  const items = listPlayers({ ...rest, limit });
  return ok(items, { total: items.length, limit, offset: 0 });
}

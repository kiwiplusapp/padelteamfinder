import { ok, parseQuery } from "@/lib/api";
import { listClubs } from "@/lib/domain/repo";
import { ClubQuery } from "@/lib/domain/schemas";

/**
 * GET /api/v1/clubs
 * Clubs with their courts, live counters and, when coordinates are supplied,
 * distance from the caller.
 */
export async function GET(request: Request) {
  const query = parseQuery(request.url, ClubQuery);
  if (!query.ok) return query.response;

  const page = listClubs(query.value);
  return ok(page.items, {
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  });
}

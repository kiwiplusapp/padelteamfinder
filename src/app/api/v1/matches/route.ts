import { created, fail, ok, parseBody, parseQuery } from "@/lib/api";
import { createMatch, listMatches } from "@/lib/domain/repo";
import { CreateMatchInput, MatchQuery } from "@/lib/domain/schemas";

/**
 * GET /api/v1/matches
 * Open matches, filtered by city, category, gender, level window, date and
 * proximity. Pass lat and lng to sort by distance and constrain to radiusKm.
 */
export async function GET(request: Request) {
  const query = parseQuery(request.url, MatchQuery);
  if (!query.ok) return query.response;

  const page = listMatches(query.value);
  return ok(page.items, {
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  });
}

/** POST /api/v1/matches - publish a match that is missing players. */
export async function POST(request: Request) {
  const body = await parseBody(request, CreateMatchInput);
  if (!body.ok) return body.response;

  const match = createMatch(body.value);
  if (!match)
    return fail("bad_request", "No se pudo crear el partido con esos datos.");

  return created(match);
}

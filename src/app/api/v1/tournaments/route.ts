import { created, fail, ok, parseBody, parseQuery } from "@/lib/api";
import { createTournament, listTournaments } from "@/lib/domain/repo";
import { CreateTournamentInput, TournamentQuery } from "@/lib/domain/schemas";

/**
 * GET /api/v1/tournaments
 * Public tournaments with their draws, registered teams and remaining places.
 * Drafts are never returned here.
 */
export async function GET(request: Request) {
  const query = parseQuery(request.url, TournamentQuery);
  if (!query.ok) return query.response;

  const page = listTournaments(query.value);
  return ok(page.items, {
    total: page.total,
    limit: page.limit,
    offset: page.offset,
  });
}

/** POST /api/v1/tournaments - club creates an event with one or more draws. */
export async function POST(request: Request) {
  const body = await parseBody(request, CreateTournamentInput);
  if (!body.ok) return body.response;

  const tournament = createTournament(body.value);
  if (!tournament) return fail("bad_request", "No se pudo crear el torneo.");

  return created(tournament);
}

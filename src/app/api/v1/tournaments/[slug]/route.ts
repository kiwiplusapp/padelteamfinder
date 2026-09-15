import { fail, ok } from "@/lib/api";
import { getTournament } from "@/lib/domain/repo";

/** GET /api/v1/tournaments/:slug */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tournament = getTournament(slug);
  if (!tournament) return fail("not_found", "Ese torneo no existe.");
  return ok(tournament);
}

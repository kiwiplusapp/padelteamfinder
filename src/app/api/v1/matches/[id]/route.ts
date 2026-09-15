import { fail, ok } from "@/lib/api";
import { getMatch } from "@/lib/domain/repo";

/** GET /api/v1/matches/:id */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = getMatch(id);
  if (!match) return fail("not_found", "Ese partido no existe.");
  return ok(match);
}

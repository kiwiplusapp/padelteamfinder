import { fail, ok } from "@/lib/api";
import { getClubView } from "@/lib/domain/repo";

/** GET /api/v1/clubs/:slug */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const club = getClubView(slug);
  if (!club) return fail("not_found", "Ese club no existe.");
  return ok(club);
}

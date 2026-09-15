import { created, fail, parseBody } from "@/lib/api";
import { registerTeam } from "@/lib/domain/repo";
import { z } from "zod";

const Body = z.object({
  playerIds: z.tuple([z.string().min(1), z.string().min(1)]),
  name: z.string().min(1).max(60).optional(),
});

/**
 * POST /api/v1/draws/:drawId/teams
 * Register a pair. Beyond maxTeams the entry is accepted onto the waiting
 * list rather than rejected, which is how clubs actually run their draws.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ drawId: string }> },
) {
  const { drawId } = await params;
  const body = await parseBody(request, Body);
  if (!body.ok) return body.response;

  const result = registerTeam(drawId, body.value.playerIds, body.value.name);
  if (!result.ok) return fail("rule_violation", result.reason);

  return created(result.team);
}

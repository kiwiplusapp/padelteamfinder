import { fail, ok, parseBody } from "@/lib/api";
import { bracketByRound, recordResult, regenerateBracket } from "@/lib/domain/repo";
import { SetScore } from "@/lib/domain/schemas";
import { z } from "zod";

/** GET /api/v1/draws/:drawId/bracket - rounds ordered first played to final. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ drawId: string }> },
) {
  const { drawId } = await params;
  const rounds = bracketByRound(drawId);
  if (!rounds.length) return fail("not_found", "Ese cuadro no tiene llaves.");
  return ok(rounds);
}

const ResultBody = z.object({
  matchId: z.string().min(1),
  sets: z.array(SetScore).min(1),
  winnerTeamId: z.string().min(1).optional(),
});

/**
 * PATCH /api/v1/draws/:drawId/bracket
 * Record a result. The winner is advanced into the next round automatically.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ drawId: string }> },
) {
  const { drawId } = await params;
  const body = await parseBody(request, ResultBody);
  if (!body.ok) return body.response;

  const result = recordResult(
    body.value.matchId,
    body.value.sets,
    body.value.winnerTeamId,
  );
  if (!result.ok) return fail("rule_violation", result.reason);

  return ok(bracketByRound(drawId));
}

/** POST /api/v1/draws/:drawId/bracket - rebuild the draw from current teams. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ drawId: string }> },
) {
  const { drawId } = await params;
  const rebuilt = regenerateBracket(drawId);
  if (!rebuilt.length)
    return fail("rule_violation", "El cuadro necesita al menos dos parejas.");
  return ok(bracketByRound(drawId));
}

import { fail, ok, parseBody } from "@/lib/api";
import { joinMatch, leaveMatch } from "@/lib/domain/repo";
import { z } from "zod";

const Body = z.object({ playerId: z.string().min(1) });

/**
 * POST /api/v1/matches/:id/join
 * Rejects on a full match, a duplicate join, or a level outside the window.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await parseBody(request, Body);
  if (!body.ok) return body.response;

  const result = joinMatch(id, body.value.playerId);
  if (!result.ok) return fail("rule_violation", result.reason);

  return ok(result.match);
}

/** DELETE /api/v1/matches/:id/join - give up a seat. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await parseBody(request, Body);
  if (!body.ok) return body.response;

  const result = leaveMatch(id, body.value.playerId);
  if (!result.ok) return fail("rule_violation", result.reason);

  return ok(result.match);
}

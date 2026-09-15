import { NextResponse } from "next/server";
import { z } from "zod";

/* ============================================================================
   API conventions.

   Every /api/v1 response uses the same envelope so a mobile client can write
   one decoder and one error path:

     success  { "data": T, "meta"?: { total, limit, offset } }
     failure  { "error": { "code": string, "message": string, "details"?: ... } }

   Codes are stable strings, not HTTP numbers, so clients can branch on them
   without parsing prose.
   ========================================================================== */

export type ApiMeta = {
  total?: number;
  limit?: number;
  offset?: number;
};

export function ok<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  return NextResponse.json(meta ? { data, meta } : { data }, {
    status: 200,
    ...init,
  });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export type ErrorCode =
  | "bad_request"
  | "validation_failed"
  | "not_found"
  | "conflict"
  | "rule_violation"
  | "server_error";

const STATUS_FOR: Record<ErrorCode, number> = {
  bad_request: 400,
  validation_failed: 422,
  not_found: 404,
  conflict: 409,
  rule_violation: 409,
  server_error: 500,
};

export function fail(code: ErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    { error: { code, message, ...(details ? { details } : {}) } },
    { status: STATUS_FOR[code] },
  );
}

/** Turn a ZodError into the details payload clients render next to fields. */
export function zodDetails(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

/**
 * Parse search params against a schema. Repeated keys collapse to the last
 * value, which matches how the filter UI serialises state.
 */
export function parseQuery<S extends z.ZodType>(
  url: string,
  schema: S,
): { ok: true; value: z.infer<S> } | { ok: false; response: NextResponse } {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    return {
      ok: false,
      response: fail(
        "validation_failed",
        "Parámetros de búsqueda no válidos.",
        zodDetails(result.error),
      ),
    };
  }
  return { ok: true, value: result.data };
}

/** Parse a JSON body against a schema, handling malformed JSON as a 400. */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<
  { ok: true; value: z.infer<S> } | { ok: false; response: NextResponse }
> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: fail("bad_request", "El cuerpo de la petición no es JSON."),
    };
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      response: fail(
        "validation_failed",
        "Los datos enviados no son válidos.",
        zodDetails(result.error),
      ),
    };
  }
  return { ok: true, value: result.data };
}

import { ok } from "@/lib/api";
import { listCities, platformTotals } from "@/lib/domain/repo";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  GENDER_LABEL,
  FORMAT_LABEL,
} from "@/lib/domain/schemas";

/**
 * GET /api/v1/meta
 * Filter vocabulary and live counters in one call, so a mobile client can
 * build its filter sheets without hardcoding Spanish labels.
 */
export async function GET() {
  return ok({
    cities: listCities(),
    categories: CATEGORY_ORDER.map((value) => ({
      value,
      label: CATEGORY_LABEL[value],
    })),
    genders: Object.entries(GENDER_LABEL).map(([value, label]) => ({
      value,
      label,
    })),
    formats: Object.entries(FORMAT_LABEL).map(([value, label]) => ({
      value,
      label,
    })),
    levelRange: { min: 0, max: 7, step: 0.5 },
    totals: platformTotals(),
  });
}

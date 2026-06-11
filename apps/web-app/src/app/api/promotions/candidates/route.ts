import { NextResponse } from "next/server";
import { readPlannerState } from "../../../../services/storage";
import { buildPromotionCandidates, MAX_PROMOTION_BATCH_SIZE } from "../../../../services/promotion-engine";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const limit = Number(body.limit || MAX_PROMOTION_BATCH_SIZE);
  const minCost = Math.max(0, Number(body.minCost || 0));
  const state = await readPlannerState();
  const candidates = buildPromotionCandidates(state.inventory, { limit, minCost });

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    maxBatchSize: MAX_PROMOTION_BATCH_SIZE,
    minCost,
    candidates
  });
}

import { NextResponse } from "next/server";
import { readPlannerState } from "../../../../services/storage";
import { buildPromotionCandidates, MAX_PROMOTION_BATCH_SIZE } from "../../../../services/promotion-engine";
import { generatePromotionCopy } from "../../../../services/promotion-copy-generator";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const productCodes = Array.isArray(body.productCodes) ? body.productCodes.slice(0, MAX_PROMOTION_BATCH_SIZE) : [];
  const state = await readPlannerState();
  const candidates = buildPromotionCandidates(state.inventory, MAX_PROMOTION_BATCH_SIZE);
  const selected = productCodes.length
    ? candidates.filter((candidate) => productCodes.includes(candidate.productCode))
    : candidates.slice(0, Math.min(Number(body.limit || 30), MAX_PROMOTION_BATCH_SIZE));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    items: selected.map((candidate) => ({
      productCode: candidate.productCode,
      productName: candidate.productName,
      copy: generatePromotionCopy(candidate)
    }))
  });
}


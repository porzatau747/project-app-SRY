import { NextResponse } from "next/server";
import { readPlannerState } from "../../../../services/storage";
import { buildPromotionCandidates, MAX_PROMOTION_BATCH_SIZE } from "../../../../services/promotion-engine";
import { buildBatchItem } from "../../../../services/promotion-copy-generator";
import { createPromotionBatch, readPromotionStore } from "../../../../services/promotion-storage";
import type { PromotionBatch, PromotionCampaignType, PromotionTemplatePreset } from "../../../../types/promotion";

export async function GET() {
  return NextResponse.json(await readPromotionStore());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const selectedCodes = Array.isArray(body.productCodes) ? body.productCodes.slice(0, MAX_PROMOTION_BATCH_SIZE) : [];
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Promotion Batch";
  const campaignType = (body.campaignType || "clearance") as PromotionCampaignType;
  const templatePreset = (body.templatePreset || "clearance") as PromotionTemplatePreset;

  const state = await readPlannerState();
  const allCandidates = buildPromotionCandidates(state.inventory, MAX_PROMOTION_BATCH_SIZE);
  const selected = selectedCodes.length
    ? allCandidates.filter((candidate) => selectedCodes.includes(candidate.productCode))
    : allCandidates.slice(0, Math.min(Number(body.limit || 30), MAX_PROMOTION_BATCH_SIZE));

  const now = new Date().toISOString();
  const batch: PromotionBatch = {
    id: `promo-${Date.now()}`,
    name,
    campaignType,
    templatePreset,
    createdAt: now,
    updatedAt: now,
    exportedAt: null,
    status: "needs_review",
    items: selected.map((candidate, index) => buildBatchItem(candidate, index, { campaignType, templatePreset }))
  };

  return NextResponse.json(await createPromotionBatch(batch));
}

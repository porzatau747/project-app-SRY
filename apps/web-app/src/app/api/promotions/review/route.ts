import { NextResponse } from "next/server";
import { updatePromotionBatchStatuses, updatePromotionItemCopy, updatePromotionItemStatus } from "../../../../services/promotion-storage";
import type { PromotionCopy, PromotionReviewStatus } from "../../../../types/promotion";

const allowedStatuses: PromotionReviewStatus[] = ["draft", "needs_review", "approved", "rejected", "exported"];

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const batchId = String(body.batchId || "");
  const itemId = String(body.itemId || "");
  const reviewStatus = body.reviewStatus as PromotionReviewStatus;

  if (!batchId || !allowedStatuses.includes(reviewStatus)) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  const batch = body.scope === "batch"
    ? await updatePromotionBatchStatuses(batchId, reviewStatus)
    : await updatePromotionItemStatus(batchId, itemId, reviewStatus);
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  return NextResponse.json(batch);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  const batchId = String(body.batchId || "");
  const itemId = String(body.itemId || "");
  const copy = body.copy as PromotionCopy;

  if (!batchId || !itemId || !copy?.headline || !copy?.facebookCaption) {
    return NextResponse.json({ error: "Invalid copy payload" }, { status: 400 });
  }

  const batch = await updatePromotionItemCopy(batchId, itemId, copy);
  if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  return NextResponse.json(batch);
}

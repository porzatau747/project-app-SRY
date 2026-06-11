import type { PromotionBatch, PromotionBatchItem } from "../types/promotion";

function validateApprovedItem(item: PromotionBatchItem) {
  const errors: string[] = [];
  if (!item.copy.headline.trim()) errors.push("headline is required");
  if (!item.copy.priceText.trim()) errors.push("priceText is required");
  if (!item.copy.cta.trim()) errors.push("cta is required");
  if (!item.copy.facebookCaption.trim()) errors.push("facebookCaption is required");
  if (item.copy.facebookCaption.length > 2200) errors.push("facebookCaption should be 2200 characters or less");
  return errors;
}

export function validatePromotionBatchForExport(batch: PromotionBatch) {
  const approvedItems = batch.items.filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported");
  const errors: string[] = [];

  if (approvedItems.length === 0) {
    errors.push("No approved items to export");
  }

  for (const item of approvedItems) {
    const itemErrors = validateApprovedItem(item);
    for (const error of itemErrors) {
      errors.push(`${item.productCode}: ${error}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

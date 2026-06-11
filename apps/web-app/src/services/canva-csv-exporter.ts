import type { PromotionBatch } from "../types/promotion";

const headers = [
  "product_code",
  "campaign_type",
  "template_preset",
  "product_name",
  "category",
  "price_text",
  "headline",
  "subheadline",
  "body_copy",
  "cta",
  "facebook_caption",
  "disclaimer",
  "hashtags"
];

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export function promotionBatchToCanvaCsv(batch: PromotionBatch) {
  const approvedItems = batch.items.filter((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported");
  const rows = approvedItems.map((item) => [
    item.productCode,
    batch.campaignType || "clearance",
    batch.templatePreset || "clearance",
    item.productName,
    item.itemType,
    item.copy.priceText,
    item.copy.headline,
    item.copy.subheadline,
    item.copy.bodyCopy,
    item.copy.cta,
    item.copy.facebookCaption,
    item.copy.disclaimer,
    item.copy.hashtags.join(" ")
  ]);

  return `\uFEFF${[headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
}

export function canvaCsvFileName(batch: PromotionBatch) {
  const safeName = batch.name.replace(/[^\wก-๙-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${safeName || "promotion-batch"}-${batch.id}.csv`;
}

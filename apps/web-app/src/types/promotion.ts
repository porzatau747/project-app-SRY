import type { InventoryItem } from "./planner";

export type PromotionCandidateReason =
  | "aged-stock"
  | "high-margin"
  | "seasonal-it"
  | "missing-price"
  | "healthy-stock";

export type PromotionReviewStatus = "draft" | "needs_review" | "approved" | "rejected" | "exported";
export type PromotionCampaignType = "clearance" | "special-price" | "limited-stock" | "back-to-school" | "gaming-upgrade";
export type PromotionTemplatePreset = "clearance" | "notebook" | "gaming-gear" | "printer" | "accessory";

export type PromotionCopy = {
  headline: string;
  subheadline: string;
  priceText: string;
  bodyCopy: string;
  cta: string;
  facebookCaption: string;
  disclaimer: string;
  hashtags: string[];
};

export type PromotionCandidate = {
  productCode: string;
  productName: string;
  itemType: string;
  qty: number;
  agingDays: number;
  cost: number;
  sellPrice: number | null;
  margin: number | null;
  score: number;
  reasons: PromotionCandidateReason[];
  recommendation: string;
  source: InventoryItem;
};

export type PromotionBatchItem = {
  id: string;
  productCode: string;
  productName: string;
  itemType: string;
  qty: number;
  agingDays: number;
  cost: number;
  sellPrice: number | null;
  margin: number | null;
  score: number;
  reasons: PromotionCandidateReason[];
  recommendation: string;
  reviewStatus: PromotionReviewStatus;
  copy: PromotionCopy;
  sourceSnapshot: InventoryItem;
};

export type PromotionBatch = {
  id: string;
  name: string;
  campaignType: PromotionCampaignType;
  templatePreset: PromotionTemplatePreset;
  createdAt: string;
  updatedAt: string;
  exportedAt: string | null;
  status: PromotionReviewStatus;
  items: PromotionBatchItem[];
};

export type PromotionBatchStore = {
  batches: PromotionBatch[];
};

import { describe, expect, it } from "vitest";
import { validatePromotionBatchForExport } from "./promotion-export-validator";
import type { PromotionBatch } from "../types/promotion";

const batch: PromotionBatch = {
  id: "batch-1",
  name: "Test Batch",
  campaignType: "clearance",
  templatePreset: "notebook",
  createdAt: "2026-06-11T00:00:00.000Z",
  updatedAt: "2026-06-11T00:00:00.000Z",
  exportedAt: null,
  status: "approved",
  items: [
    {
      id: "item-1",
      productCode: "SKU-1",
      productName: "Notebook",
      itemType: "Notebook",
      qty: 1,
      agingDays: 120,
      cost: 1000,
      sellPrice: 1500,
      margin: 500,
      score: 100,
      reasons: ["aged-stock"],
      recommendation: "Test",
      reviewStatus: "approved",
      copy: {
        headline: "Headline",
        subheadline: "Subheadline",
        priceText: "ราคา 1,500 บาท",
        bodyCopy: "Body",
        cta: "CTA",
        facebookCaption: "Caption",
        disclaimer: "Disclaimer",
        hashtags: ["#Test"]
      },
      sourceSnapshot: {
        itemType: "Notebook",
        code: "SKU-1",
        product: "Notebook",
        serial: "",
        qty: 1,
        agingDays: 120,
        agingBucket: "120-179",
        store: "HQ",
        cost: 1000,
        sellPrice: 1500,
        stockValue: 1000,
        projectedRevenue: 1500,
        margin: 500
      }
    }
  ]
};

describe("promotion-export-validator", () => {
  it("accepts approved items with required copy fields", () => {
    expect(validatePromotionBatchForExport(batch).ok).toBe(true);
  });

  it("rejects empty required copy fields", () => {
    const result = validatePromotionBatchForExport({
      ...batch,
      items: [{ ...batch.items[0], copy: { ...batch.items[0].copy, headline: "" } }]
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("headline is required");
  });
});


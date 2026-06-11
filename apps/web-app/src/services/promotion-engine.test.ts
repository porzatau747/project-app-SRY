import { describe, expect, it } from "vitest";
import { buildPromotionCandidates, MAX_PROMOTION_BATCH_SIZE } from "./promotion-engine";
import { generatePromotionCopy } from "./promotion-copy-generator";
import type { InventoryItem } from "../types/planner";

function item(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    itemType: "Notebook",
    code: "SKU-1",
    product: "Test Notebook",
    serial: "",
    qty: 1,
    agingDays: 10,
    agingBucket: "0-30",
    store: "HQ",
    cost: 1000,
    sellPrice: 1500,
    stockValue: 1000,
    projectedRevenue: 1500,
    margin: 500,
    ...overrides
  };
}

describe("promotion-engine", () => {
  it("prioritizes aged and high-margin stock", () => {
    const candidates = buildPromotionCandidates([
      item({ code: "LOW", product: "Low Score", agingDays: 5, margin: 50, sellPrice: 1000 }),
      item({ code: "HIGH", product: "High Score", agingDays: 180, margin: 800, sellPrice: 2000 })
    ]);

    expect(candidates[0].productCode).toBe("HIGH");
    expect(candidates[0].reasons).toContain("aged-stock");
    expect(candidates[0].reasons).toContain("high-margin");
  });

  it("limits batches to 500 products", () => {
    const items = Array.from({ length: 520 }, (_, index) => item({ code: `SKU-${index}`, product: `Product ${index}` }));
    const candidates = buildPromotionCandidates(items, 999);

    expect(candidates).toHaveLength(MAX_PROMOTION_BATCH_SIZE);
  });

  it("keeps missing price candidates with safe reason", () => {
    const candidates = buildPromotionCandidates([
      item({ code: "NO-PRICE", sellPrice: null, projectedRevenue: null, margin: null })
    ]);

    expect(candidates[0].reasons).toContain("missing-price");
  });

  it("deduplicates same product name and keeps the highest aging item", () => {
    const candidates = buildPromotionCandidates([
      item({ code: "YOUNG", product: "Same Product", agingDays: 30 }),
      item({ code: "OLD", product: "Same Product", agingDays: 180 })
    ]);

    expect(candidates).toHaveLength(1);
    expect(candidates[0].productCode).toBe("OLD");
    expect(candidates[0].agingDays).toBe(180);
  });

  it("filters out products with cost below minCost", () => {
    const candidates = buildPromotionCandidates([
      item({ code: "LOW-COST", product: "Low Cost", cost: 500 }),
      item({ code: "HIGH-COST", product: "High Cost", cost: 2000 })
    ], { minCost: 1000 });

    expect(candidates.map((candidate) => candidate.productCode)).toEqual(["HIGH-COST"]);
  });

  it("uses campaign type and template preset in generated copy", () => {
    const candidate = buildPromotionCandidates([item({ code: "GAME", product: "Gaming Mouse", itemType: "Gaming" })])[0];
    const copy = generatePromotionCopy(candidate, { campaignType: "gaming-upgrade", templatePreset: "gaming-gear" });

    expect(copy.headline).toContain("อัปเกรดเกมมิ่ง");
    expect(copy.hashtags).toContain("#GamingGear");
  });
});

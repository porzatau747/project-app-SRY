import { describe, expect, it } from "vitest";
import { promotionBatchToCanvaCsv } from "./canva-csv-exporter";
import type { PromotionBatch } from "../types/promotion";

const batch: PromotionBatch = {
  id: "batch-1",
  name: "Test Batch",
  createdAt: "2026-06-11T00:00:00.000Z",
  updatedAt: "2026-06-11T00:00:00.000Z",
  exportedAt: null,
  status: "needs_review",
  items: [
    {
      id: "item-1",
      productCode: "SKU-1",
      productName: "Notebook, Pro 14",
      itemType: "Notebook",
      qty: 2,
      agingDays: 120,
      cost: 1000,
      sellPrice: 1590,
      margin: 590,
      score: 100,
      reasons: ["aged-stock"],
      recommendation: "Test",
      reviewStatus: "approved",
      copy: {
        headline: "โปรแรง \"คุ้ม\"",
        subheadline: "Notebook",
        priceText: "ราคา 1,590 บาท",
        bodyCopy: "พร้อมขาย",
        cta: "ทักแชต",
        facebookCaption: "โปรแรง\nทักแชต",
        disclaimer: "ราคาอาจเปลี่ยนแปลง",
        hashtags: ["#Adviceสามร้อยยอด"]
      },
      sourceSnapshot: {
        itemType: "Notebook",
        code: "SKU-1",
        product: "Notebook, Pro 14",
        serial: "",
        qty: 2,
        agingDays: 120,
        agingBucket: "120-179",
        store: "HQ",
        cost: 1000,
        sellPrice: 1590,
        stockValue: 2000,
        projectedRevenue: 3180,
        margin: 590
      }
    }
  ]
};

describe("canva-csv-exporter", () => {
  it("exports UTF-8 BOM CSV and escapes commas, quotes, and newlines", () => {
    const csv = promotionBatchToCanvaCsv(batch);

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"Notebook, Pro 14"');
    expect(csv).toContain('"โปรแรง ""คุ้ม"""');
    expect(csv).toContain('"โปรแรง\nทักแชต"');
  });

  it("exports only approved items", () => {
    const csv = promotionBatchToCanvaCsv({
      ...batch,
      items: [{ ...batch.items[0], reviewStatus: "rejected" }]
    });

    expect(csv).not.toContain("SKU-1");
  });
});


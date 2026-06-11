import { mkdtemp, rm } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createPromotionBatch, updatePromotionBatchStatuses, updatePromotionItemCopy } from "./promotion-storage";
import type { PromotionBatch } from "../types/promotion";

let originalCwd: string;
let tempDir: string;

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
      productName: "Notebook",
      itemType: "Notebook",
      qty: 1,
      agingDays: 90,
      cost: 1000,
      sellPrice: 1500,
      margin: 500,
      score: 100,
      reasons: ["aged-stock"],
      recommendation: "Test",
      reviewStatus: "needs_review",
      copy: {
        headline: "Old Headline",
        subheadline: "Sub",
        priceText: "ราคา 1,500 บาท",
        bodyCopy: "Body",
        cta: "CTA",
        facebookCaption: "Old Caption",
        disclaimer: "Disclaimer",
        hashtags: ["#Test"]
      },
      sourceSnapshot: {
        itemType: "Notebook",
        code: "SKU-1",
        product: "Notebook",
        serial: "",
        qty: 1,
        agingDays: 90,
        agingBucket: "90-119",
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

beforeEach(async () => {
  originalCwd = process.cwd();
  tempDir = await mkdtemp(path.join(os.tmpdir(), "promotion-storage-"));
  process.chdir(tempDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(tempDir, { recursive: true, force: true });
});

describe("promotion-storage", () => {
  it("updates copy and returns item to review", async () => {
    await createPromotionBatch(batch);
    const updated = await updatePromotionItemCopy("batch-1", "item-1", {
      ...batch.items[0].copy,
      headline: "New Headline",
      facebookCaption: "New Caption"
    });

    expect(updated?.items[0].copy.headline).toBe("New Headline");
    expect(updated?.items[0].reviewStatus).toBe("needs_review");
  });

  it("updates all item statuses in a batch", async () => {
    await createPromotionBatch(batch);
    const updated = await updatePromotionBatchStatuses("batch-1", "approved");

    expect(updated?.status).toBe("approved");
    expect(updated?.items.every((item) => item.reviewStatus === "approved")).toBe(true);
  });
});


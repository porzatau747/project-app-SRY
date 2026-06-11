import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { PromotionBatch, PromotionBatchStore, PromotionCopy, PromotionReviewStatus } from "../types/promotion";

function getPromotionPaths() {
  const runtimeDataDir = path.join(process.cwd(), "data");
  return {
    dataDir: runtimeDataDir,
    promotionFile: path.join(runtimeDataDir, "promotion-batches.json")
  };
}

const defaultStore: PromotionBatchStore = {
  batches: []
};

function normalizeBatch(batch: PromotionBatch): PromotionBatch {
  return {
    ...batch,
    campaignType: batch.campaignType || "clearance",
    templatePreset: batch.templatePreset || "clearance"
  };
}

export async function readPromotionStore(): Promise<PromotionBatchStore> {
  try {
    const raw = await readFile(getPromotionPaths().promotionFile, "utf8");
    const parsed = { ...defaultStore, ...JSON.parse(raw) } as PromotionBatchStore;
    return {
      ...parsed,
      batches: parsed.batches.map(normalizeBatch)
    };
  } catch {
    return defaultStore;
  }
}

export async function writePromotionStore(store: PromotionBatchStore) {
  const paths = getPromotionPaths();
  await mkdir(paths.dataDir, { recursive: true });
  await writeFile(paths.promotionFile, JSON.stringify(store, null, 2), "utf8");
  return store;
}

export async function createPromotionBatch(batch: PromotionBatch) {
  const store = await readPromotionStore();
  const next = { batches: [batch, ...store.batches] };
  await writePromotionStore(next);
  return batch;
}

export async function getPromotionBatch(batchId: string) {
  const store = await readPromotionStore();
  return store.batches.find((batch) => batch.id === batchId) || null;
}

export async function updatePromotionItemStatus(batchId: string, itemId: string, reviewStatus: PromotionReviewStatus) {
  const store = await readPromotionStore();
  let updatedBatch: PromotionBatch | null = null;

  const batches = store.batches.map((batch) => {
    if (batch.id !== batchId) return batch;

    const items = batch.items.map((item) => item.id === itemId ? { ...item, reviewStatus } : item);
    const nextBatch: PromotionBatch = {
      ...batch,
      items,
      updatedAt: new Date().toISOString(),
      status: items.every((item) => item.reviewStatus === "approved" || item.reviewStatus === "exported") ? "approved" : "needs_review"
    };
    updatedBatch = nextBatch;
    return nextBatch;
  });

  await writePromotionStore({ batches });
  return updatedBatch;
}

export async function updatePromotionItemCopy(batchId: string, itemId: string, copy: PromotionCopy) {
  const store = await readPromotionStore();
  let updatedBatch: PromotionBatch | null = null;

  const batches = store.batches.map((batch) => {
    if (batch.id !== batchId) return batch;

    const items = batch.items.map((item) => item.id === itemId ? { ...item, copy, reviewStatus: "needs_review" as const } : item);
    const nextBatch: PromotionBatch = {
      ...batch,
      items,
      updatedAt: new Date().toISOString(),
      status: "needs_review"
    };
    updatedBatch = nextBatch;
    return nextBatch;
  });

  await writePromotionStore({ batches });
  return updatedBatch;
}

export async function updatePromotionBatchStatuses(batchId: string, reviewStatus: PromotionReviewStatus) {
  const store = await readPromotionStore();
  let updatedBatch: PromotionBatch | null = null;

  const batches = store.batches.map((batch) => {
    if (batch.id !== batchId) return batch;

    const items = batch.items.map((item) => ({ ...item, reviewStatus }));
    const nextBatch: PromotionBatch = {
      ...batch,
      items,
      updatedAt: new Date().toISOString(),
      status: reviewStatus === "approved" ? "approved" : "needs_review"
    };
    updatedBatch = nextBatch;
    return nextBatch;
  });

  await writePromotionStore({ batches });
  return updatedBatch;
}

export async function markBatchExported(batchId: string) {
  const store = await readPromotionStore();
  const now = new Date().toISOString();
  let updatedBatch: PromotionBatch | null = null;

  const batches = store.batches.map((batch) => {
    if (batch.id !== batchId) return batch;
    const nextBatch: PromotionBatch = {
      ...batch,
      status: "exported",
      exportedAt: now,
      updatedAt: now,
      items: batch.items.map((item) => item.reviewStatus === "approved" ? { ...item, reviewStatus: "exported" } : item)
    };
    updatedBatch = nextBatch;
    return nextBatch;
  });

  await writePromotionStore({ batches });
  return updatedBatch;
}

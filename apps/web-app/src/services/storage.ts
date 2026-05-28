import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { inventoryItems } from "../data/inventory";
import type { PlannerState, WeeklyPlanPost, InventoryItem, InventorySummary } from "../types/planner";

const dataDir = path.join(process.cwd(), "data");
const stateFile = path.join(dataDir, "planner-state.json");

function buildInventorySummary(items: InventoryItem[]): InventorySummary {
  const buckets = new Map<string, { qty: number; value: number }>();
  let totalQty = 0;
  let totalValue = 0;
  let totalRevenue = 0;
  let missingPriceCount = 0;

  for (const item of items) {
    totalQty += item.qty;
    totalValue += item.stockValue;
    if (item.projectedRevenue) totalRevenue += item.projectedRevenue;
    if (item.sellPrice === null) missingPriceCount++;

    const bucketData = buckets.get(item.agingBucket) || { qty: 0, value: 0 };
    bucketData.qty += item.qty;
    bucketData.value += item.stockValue;
    buckets.set(item.agingBucket, bucketData);
  }

  return {
    sourcePriceFile: "default-prices.xlsx",
    sourceStockFile: "default-stock.xlsx",
    generatedAt: new Date().toISOString(),
    totalSku: new Set(items.map((i) => i.code)).size,
    totalSerialItems: items.filter((i) => i.serial).length,
    totalQty,
    totalStockValue: totalValue,
    totalProjectedRevenue: totalRevenue,
    missingPriceCount,
    agingBuckets: Array.from(buckets.entries()).map(([bucket, data]) => ({ bucket, ...data }))
  };
}

const defaultState: PlannerState = {
  inventory: inventoryItems,
  summary: buildInventorySummary(inventoryItems),
  lastTrendSnapshot: null,
  analysis: null,
  weeklyPlan: []
};

const postTypes = ["Sales", "Knowledge", "Meme", "Engagement", "News"] as const;

function normalizePost(post: WeeklyPlanPost, index: number): WeeklyPlanPost {
  return {
    ...post,
    postType: post.postType ?? postTypes[index % postTypes.length],
    reminderAt: post.reminderAt ?? "10:00",
    trendRefs: post.trendRefs ?? [],
    generatedAsset: post.generatedAsset
      ? {
          ...post.generatedAsset,
          trendSummary: post.generatedAsset.trendSummary ?? "",
          trendSourceLabels: post.generatedAsset.trendSourceLabels ?? []
        }
      : undefined
  };
}

function hasBrokenThai(value: unknown): boolean {
  return typeof value === "string" && value.includes("เธ") && value.includes("เน");
}

function stateHasBrokenGeneratedText(state: PlannerState) {
  return state.weeklyPlan.some(
    (post) =>
      hasBrokenThai(post.reason) ||
      hasBrokenThai(post.hook) ||
      hasBrokenThai(post.cta) ||
      hasBrokenThai(post.generatedAsset?.caption) ||
      hasBrokenThai(post.generatedAsset?.artworkPrompt)
  );
}

export async function readPlannerState(): Promise<PlannerState> {
  try {
    const raw = await readFile(stateFile, "utf8");
    const parsed = { ...defaultState, ...JSON.parse(raw) } as PlannerState;
    if (stateHasBrokenGeneratedText(parsed)) {
      return {
        ...parsed,
        analysis: null,
        weeklyPlan: []
      };
    }
    return {
      ...parsed,
      weeklyPlan: parsed.weeklyPlan.map(normalizePost)
    };
  } catch {
    return defaultState;
  }
}

export async function writePlannerState(state: PlannerState) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(stateFile, JSON.stringify(state, null, 2), "utf8");
  return state;
}

export async function updatePlannerState(updater: (state: PlannerState) => PlannerState | Promise<PlannerState>) {
  const state = await readPlannerState();
  const nextState = await updater(state);
  await writePlannerState(nextState);
  return nextState;
}

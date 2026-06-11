import type { InventoryItem } from "../types/planner";
import type { PromotionCandidate, PromotionCandidateReason } from "../types/promotion";

export const MAX_PROMOTION_BATCH_SIZE = 500;

export type PromotionCandidateOptions = {
  limit?: number;
  minCost?: number;
};

const seasonalKeywordsByMonth: Record<number, string[]> = {
  1: ["notebook", "printer", "monitor", "office", "software"],
  4: ["fan", "cooler", "ups", "router", "notebook"],
  5: ["notebook", "printer", "mouse", "keyboard", "bag"],
  6: ["notebook", "printer", "mouse", "keyboard", "bag"],
  8: ["notebook", "monitor", "printer", "office"],
  10: ["gaming", "rtx", "vga", "keyboard", "mouse"],
  11: ["gaming", "rtx", "vga", "monitor", "ssd"],
  12: ["gift", "speaker", "headphone", "gaming", "notebook"]
};

function includesAny(value: string, keywords: string[]) {
  const text = value.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword));
}

function marginRate(item: InventoryItem) {
  if (!item.sellPrice || item.sellPrice <= 0 || item.margin === null) return 0;
  return item.margin / item.sellPrice;
}

function getReasons(item: InventoryItem, now = new Date()): PromotionCandidateReason[] {
  const reasons: PromotionCandidateReason[] = [];
  const text = `${item.product} ${item.itemType}`;
  const monthKeywords = seasonalKeywordsByMonth[now.getMonth() + 1] || [];

  if (item.agingDays >= 90) reasons.push("aged-stock");
  if (marginRate(item) >= 0.18) reasons.push("high-margin");
  if (monthKeywords.length > 0 && includesAny(text, monthKeywords)) reasons.push("seasonal-it");
  if (!item.sellPrice) reasons.push("missing-price");
  if (reasons.length === 0) reasons.push("healthy-stock");

  return reasons;
}

function scoreCandidate(item: InventoryItem, reasons: PromotionCandidateReason[]) {
  let score = 0;
  score += Math.min(item.agingDays, 240) * 0.25;
  score += Math.min(item.qty, 20) * 1.5;
  score += Math.min(Math.max(marginRate(item), 0), 0.5) * 100;

  if (reasons.includes("aged-stock")) score += 35;
  if (reasons.includes("high-margin")) score += 25;
  if (reasons.includes("seasonal-it")) score += 20;
  if (reasons.includes("missing-price")) score -= 20;

  return Math.max(0, Math.round(score));
}

function recommendationFor(reasons: PromotionCandidateReason[]) {
  if (reasons.includes("aged-stock")) return "ดันเป็นโปรเคลียร์สต็อก เน้นจำนวนจำกัดและความคุ้มค่า";
  if (reasons.includes("high-margin")) return "เหมาะทำโปรเพิ่มยอดขาย เพราะยังมี margin ให้เล่นข้อความการตลาดได้";
  if (reasons.includes("seasonal-it")) return "เหมาะทำคอนเทนต์ตามฤดูกาลใช้งาน IT ตอนนี้";
  if (reasons.includes("missing-price")) return "ข้อมูลราคายังไม่ครบ ควรใช้ CTA ให้ทักเช็กราคาล่าสุด";
  return "สินค้า stock พร้อมขาย เหมาะทำโพสต์แนะนำแบบปลอดภัย";
}

function productKey(item: InventoryItem) {
  return item.product.trim().toLowerCase() || item.code.trim().toLowerCase();
}

function dedupeByHighestAging(items: InventoryItem[]) {
  const uniqueItems = new Map<string, InventoryItem>();

  for (const item of items) {
    const key = productKey(item);
    const current = uniqueItems.get(key);
    if (!current || item.agingDays > current.agingDays) {
      uniqueItems.set(key, item);
    }
  }

  return Array.from(uniqueItems.values());
}

export function buildPromotionCandidates(items: InventoryItem[], optionsOrLimit: PromotionCandidateOptions | number = MAX_PROMOTION_BATCH_SIZE) {
  const options = typeof optionsOrLimit === "number" ? { limit: optionsOrLimit } : optionsOrLimit;
  const limit = options.limit ?? MAX_PROMOTION_BATCH_SIZE;
  const minCost = options.minCost ?? 0;

  return dedupeByHighestAging(items)
    .filter((item) => item.qty > 0)
    .filter((item) => item.cost >= minCost)
    .map<PromotionCandidate>((item) => {
      const reasons = getReasons(item);
      return {
        productCode: item.code,
        productName: item.product,
        itemType: item.itemType,
        qty: item.qty,
        agingDays: item.agingDays,
        cost: item.cost,
        sellPrice: item.sellPrice,
        margin: item.margin,
        score: scoreCandidate(item, reasons),
        reasons,
        recommendation: recommendationFor(reasons),
        source: item
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(limit, MAX_PROMOTION_BATCH_SIZE));
}

import * as XLSX from "xlsx";
import type { InventoryItem, InventorySummary } from "../types/planner";
import { calculateMarkedUpPrice } from "../utils/categoryUtils";

type RawRow = Record<string, string | number | null | undefined>;

function asText(value: unknown) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function asNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readRows(buffer: ArrayBuffer) {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  
  const rawData = XLSX.utils.sheet_to_json<any>(firstSheet, { header: 1 });
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i];
    if (Array.isArray(row) && row.some(val => typeof val === 'string' && val.toLowerCase() === 'code')) {
      headerRowIndex = i;
      break;
    }
  }

  return XLSX.utils.sheet_to_json<RawRow>(firstSheet, { 
    defval: "", 
    range: headerRowIndex 
  });
}

function getAgingBucket(days: number) {
  if (days >= 240) return "240+ days";
  if (days >= 180) return "180-239 days";
  if (days >= 120) return "120-179 days";
  if (days >= 90) return "90-119 days";
  return "<90 days";
}

export function buildInventoryFromWorkbooks(
  stockWorkbook: ArrayBuffer,
  priceWorkbook: ArrayBuffer,
  sourceStockFile: string,
  sourcePriceFile: string
) {
  const stockRows = readRows(stockWorkbook);
  const priceRows = readRows(priceWorkbook);
  const priceByCode = new Map<string, { sellPrice: number | null; product: string; itemType: string }>();

  for (const row of priceRows) {
    const code = asText(row.Code);
    if (!code) continue;
    const sellPrice = asNumber(row["Sell price"]);
    priceByCode.set(code, {
      sellPrice: sellPrice > 0 ? sellPrice : null,
      product: asText(row.Product),
      itemType: asText(row.Itemtype)
    });
  }

  const inventory = stockRows
    .map((row) => {
      const code = asText(row.Code);
      const price = priceByCode.get(code);
      const qty = asNumber(row.Qty) || 1;
      const cost = asNumber(row.Cost) || (asNumber(row["Sum Cost"]) / qty);
      const agingDays = asNumber(row.Aging);
      
      const itemType = asText(row.Itemtype) || price?.itemType || "Uncategorized";
      const rawSellPrice = price?.sellPrice ?? null;
      // Apply the markup logic based on raw price and itemType
      const sellPrice = calculateMarkedUpPrice(rawSellPrice, itemType);
      
      const stockValue = Number((cost * qty).toFixed(2));
      const projectedRevenue = sellPrice === null ? null : Number((sellPrice * qty).toFixed(2));

      return {
        itemType: asText(row.Itemtype) || price?.itemType || "Uncategorized",
        code,
        product: asText(row.Product) || price?.product || "Unknown product",
        serial: asText(row.Sn),
        qty,
        agingDays,
        agingBucket: getAgingBucket(agingDays),
        store: asText(row.Store),
        cost,
        sellPrice,
        stockValue,
        projectedRevenue,
        margin: projectedRevenue === null ? null : Number((projectedRevenue - stockValue).toFixed(2))
      } satisfies InventoryItem;
    })
    .filter((item) => item.code && item.product);

  return {
    inventory,
    summary: summarizeInventory(inventory, sourceStockFile, sourcePriceFile)
  };
}

export function summarizeInventory(
  inventory: InventoryItem[],
  sourceStockFile = "current stock",
  sourcePriceFile = "current price list"
): InventorySummary {
  const totalProjectedRevenue = inventory.reduce((sum, item) => sum + (item.projectedRevenue ?? 0), 0);
  const bucketMap = new Map<string, { bucket: string; qty: number; value: number }>();

  for (const item of inventory) {
    const current = bucketMap.get(item.agingBucket) ?? { bucket: item.agingBucket, qty: 0, value: 0 };
    current.qty += item.qty;
    current.value = Number((current.value + item.stockValue).toFixed(2));
    bucketMap.set(item.agingBucket, current);
  }

  return {
    sourcePriceFile,
    sourceStockFile,
    generatedAt: new Date().toISOString(),
    totalSku: new Set(inventory.map((item) => item.code)).size,
    totalSerialItems: inventory.length,
    totalQty: inventory.reduce((sum, item) => sum + item.qty, 0),
    totalStockValue: Number(inventory.reduce((sum, item) => sum + item.stockValue, 0).toFixed(2)),
    totalProjectedRevenue: Number(totalProjectedRevenue.toFixed(2)),
    missingPriceCount: inventory.filter((item) => item.sellPrice === null).length,
    agingBuckets: Array.from(bucketMap.values())
  };
}

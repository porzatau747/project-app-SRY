import inventoryData from "./inventory.json";

export type InventoryItem = {
  itemType: string;
  code: string;
  product: string;
  serial: string;
  qty: number;
  agingDays: number;
  agingBucket: string;
  store: string;
  cost: number;
  sellPrice: number | null;
  stockValue: number;
  projectedRevenue: number | null;
  margin: number | null;
};

export const inventoryItems: InventoryItem[] = inventoryData as InventoryItem[];

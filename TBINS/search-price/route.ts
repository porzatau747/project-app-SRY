import { NextResponse } from "next/server";
import { readPlannerState, writePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemCode } = body;
    if (!itemCode) {
      return NextResponse.json({ error: "ระบุรหัสสินค้า (itemCode)" }, { status: 400 });
    }

    const state = await readPlannerState();
    const itemIndex = state.inventory.findIndex(i => i.code === itemCode);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "ไม่พบสินค้าในสต็อก" }, { status: 404 });
    }

    const item = state.inventory[itemIndex];
    
    // Simulate finding a base price using a mock/random logic 
    // since we don't have a real Advice Search API integration yet.
    // In production, this would call Advice website scraper or Google Custom Search.
    
    // Fallback logic: Assume a random base price for demonstration
    // If we have cost, maybe base price is slightly above cost.
    let basePrice = item.cost > 0 ? item.cost * 1.1 : Math.floor(Math.random() * 2000) + 100;
    
    // Calculate new sell price based on user's rule:
    // < 500 = +30%
    // 500 - 1000 = +15%
    // > 1000 = +10%
    let newPrice = basePrice;
    if (basePrice < 500) {
      newPrice = basePrice * 1.30;
    } else if (basePrice <= 1000) {
      newPrice = basePrice * 1.15;
    } else {
      newPrice = basePrice * 1.10;
    }

    // Round to nearest 10 (e.g. 493 -> 490)
    newPrice = Math.round(newPrice / 10) * 10;

    // Update in state
    state.inventory[itemIndex].sellPrice = newPrice;
    
    // Update missing price count and revenue in summary
    if (state.summary) {
      state.summary.missingPriceCount = state.inventory.filter(i => !i.sellPrice).length;
      state.summary.totalProjectedRevenue = state.inventory.reduce((sum, item) => sum + ((item.sellPrice || item.cost) * item.qty), 0);
    }
    
    await writePlannerState(state);

    return NextResponse.json(state);
  } catch (error) {
    console.error("Error searching price:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการค้นหาราคา" },
      { status: 500 }
    );
  }
}

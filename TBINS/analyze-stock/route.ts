import { NextResponse } from "next/server";
import { analyzeStockForContent } from "../../../services/ai";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  await request.json().catch(() => ({}));

  const state = await updatePlannerState(async (current) => {
    const analysis = await analyzeStockForContent(current.inventory, current.lastTrendSnapshot);
    return {
      ...current,
      lastTrendSnapshot: analysis.trendSnapshot,
      analysis,
      weeklyPlan: []
    };
  });

  return NextResponse.json(state);
}

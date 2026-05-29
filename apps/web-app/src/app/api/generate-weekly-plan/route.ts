import { NextResponse } from "next/server";
import { generateWeeklyPlan, analyzeStockForContent } from "../../../services/ai";
import { updatePlannerState } from "../../../services/storage";

export async function POST() {
  try {
    const state = await updatePlannerState(async (current) => {
      let analysis = current.analysis;
      if (!analysis) {
        if (!current.inventory || current.inventory.length === 0) {
          throw new Error("กรุณาอัปโหลดสต็อกก่อนสร้างตาราง 7 วัน");
        }
        analysis = await analyzeStockForContent(current.inventory);
      }

      const weeklyPlan = await generateWeeklyPlan(analysis);
      return {
        ...current,
        analysis,
        weeklyPlan
      };
    });

    return NextResponse.json(state);
  } catch (error: unknown) {
    console.error("Weekly plan generation error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

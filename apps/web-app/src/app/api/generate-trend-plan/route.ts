import { NextResponse } from "next/server";
import { generateTrendContentPlan } from "../../../services/ai";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  await request.json().catch(() => ({}));
  const plan = await generateTrendContentPlan();
  await updatePlannerState((current) => ({
    ...current,
    lastTrendSnapshot: plan.trendSnapshot
  }));

  return NextResponse.json(plan);
}

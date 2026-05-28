import { NextResponse } from "next/server";
import { addSinglePost } from "../../../services/ai";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  const { itemCode } = await request.json().catch(() => ({}));
  if (!itemCode) return NextResponse.json({ error: "Missing itemCode" }, { status: 400 });

  const state = await updatePlannerState((current) => {
    if (!current.analysis) return current;
    const newPost = addSinglePost(itemCode, current.analysis, current.weeklyPlan, current.inventory);
    if (!newPost) return current;
    
    return {
      ...current,
      weeklyPlan: [...current.weeklyPlan, newPost]
    };
  });

  return NextResponse.json(state);
}

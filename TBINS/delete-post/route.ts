import { NextResponse } from "next/server";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  const { postId } = await request.json().catch(() => ({}));
  if (!postId) return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  const state = await updatePlannerState((current) => {
    return {
      ...current,
      weeklyPlan: current.weeklyPlan.filter(post => post.id !== postId)
    };
  });

  return NextResponse.json(state);
}

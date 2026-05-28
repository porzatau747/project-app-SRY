import { NextResponse } from "next/server";
import { updatePlannerState } from "../../../services/storage";

const validDays = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const postId = String(body.postId || "");
  const targetDay = String(body.targetDay || "");

  if (!postId || !validDays.has(targetDay)) {
    return NextResponse.json({ error: "postId and a valid targetDay are required." }, { status: 400 });
  }

  let found = false;
  const state = await updatePlannerState((current) => {
    const dragged = current.weeklyPlan.find((post) => post.id === postId);
    if (!dragged) return current;
    found = true;

    return {
      ...current,
      weeklyPlan: current.weeklyPlan.map((post) => {
        if (post.id === postId) return { ...post, day: targetDay };
        if (post.day === targetDay) return { ...post, day: dragged.day };
        return post;
      })
    };
  });

  if (!found) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(state);
}

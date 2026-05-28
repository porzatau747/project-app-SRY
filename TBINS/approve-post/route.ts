import { NextResponse } from "next/server";
import { updatePlannerState } from "../../../services/storage";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const postId = String(body.postId || "");

  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  let found = false;
  const state = await updatePlannerState((current) => ({
    ...current,
    weeklyPlan: current.weeklyPlan.map((post) => {
      if (post.id !== postId) return post;
      found = true;
      return { ...post, status: post.status === "generated" ? "generated" : "approved" };
    })
  }));

  if (!found) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(state);
}

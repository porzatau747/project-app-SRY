import { NextResponse } from "next/server";
import { generatePostBrief } from "../../../services/ai";
import { updatePlannerState } from "../../../services/storage";
import { findRelatedTrends, getCurrentTrendSnapshot, mergeTrendRefs } from "../../../services/trends";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const postId = String(body.postId || "");
  const refreshTrends = Boolean(body.refreshTrends);

  if (!postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  let error: string | null = null;
  const state = await updatePlannerState(async (current) => {
    const post = current.weeklyPlan.find((item) => item.id === postId);

    if (!post) {
      error = "Post not found.";
      return current;
    }



    const refreshedSnapshot = refreshTrends ? await getCurrentTrendSnapshot() : current.lastTrendSnapshot;
    const trendRefs = refreshedSnapshot
      ? mergeTrendRefs(findRelatedTrends(`${post.productFocus} ${post.category}`, refreshedSnapshot), post.trendRefs)
      : post.trendRefs;
    const generatedAsset = await generatePostBrief({ ...post, trendRefs }, trendRefs);

    return {
      ...current,
      lastTrendSnapshot: refreshedSnapshot ?? current.lastTrendSnapshot,
      weeklyPlan: current.weeklyPlan.map((item) =>
        item.id === postId ? { ...item, status: "generated", trendRefs, generatedAsset } : item
      )
    };
  });

  if (error) {
    return NextResponse.json({ error }, { status: error === "Post not found." ? 404 : 400 });
  }

  return NextResponse.json(state);
}

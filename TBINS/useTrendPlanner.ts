import { useState, useMemo } from "react";
import type { TrendContentPlan, TrendSnapshotItem } from "../types/planner";
import { createPostFromNews } from "../utils/post-builder";

type ActionState = {
  loading: boolean;
  message: string;
  error: string;
};

async function parseTrendResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "สร้างแผนไม่สำเร็จ");
  return body as TrendContentPlan;
}

export function useTrendPlanner(initialPlan: TrendContentPlan) {
  const [plan, setPlan] = useState(initialPlan);
  const [action, setAction] = useState<ActionState>({ loading: false, message: "", error: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const topPosts = useMemo(
    () => [...plan.weeklyPosts].sort((a, b) => b.viralScore - a.viralScore).slice(0, 3),
    [plan.weeklyPosts]
  );

  async function updateData() {
    setIsUpdating(true);
    setAction({ loading: true, message: "กำลังดึงข้อมูลข่าว IT ล่าสุด (ใช้เวลาสักครู่)...", error: "" });
    try {
      const res = await fetch("/api/update-trends", { method: "POST", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
      setAction({ loading: false, message: `อัปเดตข้อมูลล่าสุดสำเร็จ (${data.count} โพสต์)`, error: "" });
    } catch (error) {
      setAction({ loading: false, message: "", error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
    } finally {
      setIsUpdating(false);
    }
  }

  async function generatePlan() {
    setAction({ loading: true, message: "กำลังวิเคราะห์ข่าว IT ไทยและต่างประเทศ พร้อมจับคู่เทรนด์", error: "" });
    try {
      const nextPlan = await parseTrendResponse(
        await fetch("/api/generate-trend-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({})
        })
      );
      setPlan(nextPlan);
      setAction({ loading: false, message: "สร้างแผนเทรนด์ 7 วันสำเร็จ", error: "" });
    } catch (error) {
      setAction({
        loading: false,
        message: "",
        error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด"
      });
    }
  }

  async function addNewsToPlan(newsItem: TrendSnapshotItem) {
    const newPost = createPostFromNews(newsItem, plan.weeklyPosts.length);

    setPlan(current => ({
      ...current,
      weeklyPosts: [...current.weeklyPosts, newPost]
    }));
    setAction({ loading: false, message: "เพิ่มข่าวลงปฏิทินสำเร็จ", error: "" });
  }

  return { plan, action, topPosts, generatePlan, updateData, isUpdating, addNewsToPlan };
}

import TrendPlannerApp from "./TrendPlannerApp";
import type { TrendContentPlan } from "../../types/planner";

export default function TrendPlannerPage() {
  const emptyPlan: TrendContentPlan = {
    generatedAt: "",
    trendSnapshot: {
      fetchedAt: new Date().toISOString(),
      generatedFrom: "fallback",
      headline: "รอการดึงข่าว IT ล่าสุด...",
      items: [],
    },
    memeSignals: [],
    positioning: "รอการวิเคราะห์เพจ",
    trendSourcesNote: "คลิกปุ่ม Generate แผนเทรนด์ 7 วัน เพื่อเริ่มค้นหาข่าว IT และเทรนด์ไวรัลไทย",
    strategySummary: "ยังไม่มีแผน (กด Generate เพื่อสร้างแผน)",
    contentRatio: [],
    categoryFocus: [],
    memeLibrary: [],
    weeklyPosts: [],
  };

  return <TrendPlannerApp initialPlan={emptyPlan} />;
}

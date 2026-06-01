import TrendPlannerApp from "./TrendPlannerApp";
import type { TrendContentPlan } from "../../types/planner";
import { getCurrentTrendSnapshot } from "../../services/trends";

export default async function TrendPlannerPage() {
  const snapshot = await getCurrentTrendSnapshot();
  
  const initialPlan: TrendContentPlan = {
    generatedAt: "",
    trendSnapshot: snapshot,
    memeSignals: [],
    positioning: "รอการวิเคราะห์เพจ",
    trendSourcesNote: "คลิกปุ่ม Generate แผนเทรนด์ 7 วัน เพื่อเริ่มค้นหาข่าว IT และเทรนด์ไวรัลไทย",
    strategySummary: "ยังไม่มีแผน (กด Generate เพื่อสร้างแผน)",
    contentRatio: [],
    categoryFocus: [],
    memeLibrary: [],
    weeklyPosts: [],
  };

  return <TrendPlannerApp initialPlan={initialPlan} />;
}

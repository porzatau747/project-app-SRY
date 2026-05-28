import * as XLSX from "xlsx";
import type { TrendContentPlan, PlannerState } from "../types/planner";

export function exportTrendPlanToExcel(plan: TrendContentPlan) {
  const posts = plan.weeklyPosts.map(post => ({
    "วัน": post.day,
    "ประเภท (Pillar)": post.pillar,
    "หัวข้อหลัก": post.topic,
    "ที่มาเทรนด์ (Trend Signal)": post.trendSignal,
    "Meme/มุกที่ใช้": post.memeAngle,
    "ฮุก (Hook)": post.hook,
    "เนื้อหา (Breakdown)": post.contentBreakdown.join("\n"),
    "การขาย (Bridge)": post.bridgeContent.join("\n"),
    "CTA": post.cta
  }));

  const worksheet = XLSX.utils.json_to_sheet(posts);
  
  // Set column widths
  worksheet["!cols"] = [
    { wch: 15 }, // วัน
    { wch: 20 }, // ประเภท
    { wch: 30 }, // หัวข้อ
    { wch: 30 }, // ที่มา
    { wch: 25 }, // Meme
    { wch: 40 }, // ฮุก
    { wch: 50 }, // เนื้อหา
    { wch: 40 }, // การขาย
    { wch: 20 }  // CTA
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trend Plan");

  const fileName = `Trend_Content_Plan_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

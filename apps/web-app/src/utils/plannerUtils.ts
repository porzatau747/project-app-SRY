import { PostType, WeeklyPlanPost } from "../types/planner";

export const postTypeLabels: Record<PostType, string> = {
  Sales: "ขาย/โปรโมชัน",
  Meme: "มีม/ไวรัล",
  Knowledge: "ให้ความรู้",
  Engagement: "ชวนคุย",
  News: "เกาะกระแส IT",
};

export function thaiDay(englishDay: string) {
  const map: Record<string, string> = {
    Monday: "วันจันทร์",
    Tuesday: "วันอังคาร",
    Wednesday: "วันพุธ",
    Thursday: "วันพฤหัสบดี",
    Friday: "วันศุกร์",
    Saturday: "วันเสาร์",
    Sunday: "วันอาทิตย์",
  };
  return map[englishDay] || englishDay;
}

export function statusLabel(status: WeeklyPlanPost["status"]) {
  if (status === "approved") return "อนุมัติแล้ว";
  if (status === "generated") return "สร้างแล้ว";
  return "ร่าง";
}

export function priorityLabel(priority: WeeklyPlanPost["priority"]) {
  if (priority === "urgent") return "เร่งด่วน";
  if (priority === "high") return "สำคัญมาก";
  if (priority === "medium") return "ปานกลาง";
  return "ต่ำ";
}

export function calculateAgingDiscount(sellPrice: number | null, agingDays: number) {
  if (!sellPrice) return null;
  
  const originalPrice = Math.ceil((sellPrice * 1.1) / 10) * 10;
  
  let discount = 0;
  if (agingDays > 120) discount = 0.20;
  else if (agingDays > 90) discount = 0.10;
  else if (agingDays > 60) discount = 0.05;
  
  const specialPrice = discount > 0 ? Math.floor((sellPrice * (1 - discount)) / 10) * 10 : sellPrice;
  
  return { originalPrice, specialPrice, discount };
}

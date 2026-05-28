import type { PostType, TrendSnapshotItem, TrendContentPost } from "../types/planner";

export function postTemplate(postType: PostType, product: string) {
  const templates: Record<PostType, { angle: string; hook: string; cta: string }> = {
    Sales: {
      angle: "โปรหรือ Clearance ที่เน้นความคุ้มค่า ความเร่งด่วน และจำนวนจำกัด",
      hook: `ตัวน่าดันประจำสัปดาห์: ${product}`,
      cta: "ทักแชตเพื่อเช็กสต็อกและโปรหน้าร้าน"
    },
    Meme: {
      angle: "มีมใกล้ตัวที่โยงกลับมาหาสินค้าแบบไม่ขายแข็ง",
      hook: `POV: ถึงเวลาที่ ${product} โผล่มาช่วยชีวิต`,
      cta: "คอมเมนต์ว่าคุณเคยเจอโมเมนต์นี้ไหม"
    },
    Knowledge: {
      angle: "โพสต์ให้ความรู้หรือเปรียบเทียบแบบช่วยตัดสินใจ",
      hook: `เลือก ${product} ยังไงให้คุ้มในปีนี้`,
      cta: "เซฟไว้ก่อนตัดสินใจ หรือทักมาขอให้ร้านช่วยเทียบรุ่น"
    },
    Engagement: {
      angle: "ชวนคุย ชวนโหวต หรือถามประสบการณ์ใช้งาน",
      hook: `ถ้าจะอัปเกรด 1 ชิ้นวันนี้ คุณเลือก ${product} ไหม`,
      cta: "โหวตในคอมเมนต์ แล้วเดี๋ยวร้านช่วยสรุปตัวเลือกให้"
    },
    News: {
      angle: "อัปเดตข่าว IT ใหญ่แล้วโยงกลับมาเป็นคำแนะนำที่ใช้ได้จริง",
      hook: `ข่าว IT ที่กำลังมาแรง และ ${product} เกี่ยวอะไรด้วย`,
      cta: "ติดตามไว้ เดี๋ยวร้านสรุปตัวคุ้มให้ทุกสัปดาห์"
    }
  };

  return templates[postType];
}

export function memeTypeForTrend(trend?: TrendSnapshotItem): TrendContentPost["memeType"] {
  if (trend?.category === "RTX / PCGaming") return "gamer meme";
  if (trend?.category === "Office Productivity") return "office meme";
  if (trend?.category === "AI") return "AI meme";
  if (trend?.category === "Windows / PC Pain") return "reaction meme";
  return "nostalgia meme";
}

export function contentTypeForPillar(pillar: TrendContentPost["pillar"]) {
  if (pillar === "Meme + Trend") return "Meme News";
  if (pillar === "Useful IT") return "ทิปส์ไอที";
  if (pillar === "Local / Human Content") return "กิจกรรม / คุยกับลูกค้า";
  return "แนะนำสินค้า";
}

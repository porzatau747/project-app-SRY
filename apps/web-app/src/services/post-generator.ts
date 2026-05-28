import type { GeneratedPostAsset, PostType, TrendSnapshotItem, WeeklyPlanPost } from "../types/planner";
import { trendSourceLabels } from "./trends";

function hashtagsByType(postType: PostType) {
  const map: Record<PostType, string[]> = {
    Sales: ["#โปรไอที", "#ของมันต้องมี", "#ดีลคุ้ม"],
    Meme: ["#มีมไอที", "#สายไอที", "#เรื่องมันมีอยู่ว่า"],
    Knowledge: ["#ความรู้ไอที", "#เลือกของให้คุ้ม", "#อัปเดตเทค"],
    Engagement: ["#ชวนคุย", "#ถามคนไอที", "#แชร์ประสบการณ์"],
    News: ["#ข่าวไอที", "#อัปเดตเทรนด์", "#TechTrend"]
  };

  return map[postType];
}

function buildCaption(post: WeeklyPlanPost, trends: TrendSnapshotItem[]) {
  const trend = trends[0];
  const trendLead = trend ? `ตอนนี้กระแส "${trend.label}" กำลังมาแรงจาก ${trend.source}` : "ตอนนี้กระแสไอทีกำลังเปลี่ยนเร็ว";

  return `${post.hook}

${trendLead}
${post.reason}

มุมเล่าของโพสต์นี้: ${post.contentAngle}
โฟกัสสินค้า: ${post.productFocus}

${post.cta}`;
}

function buildArtworkPrompt(post: WeeklyPlanPost, trends: TrendSnapshotItem[]) {
  const trend = trends[0];
  const trendPhrase = trend ? `เชื่อมกับเทรนด์ ${trend.label} (${trend.category})` : "เชื่อมกับเทรนด์ไอทีล่าสุด";

  return `สร้างภาพสี่เหลี่ยมจัตุรัสสำหรับร้านไอทีไทย โพสต์ประเภท ${post.postType} สินค้า ${post.productFocus} ${trendPhrase} สไตล์สะอาด อ่านง่าย เน้นตัวสินค้าและ headline ภาษาไทยชัดเจน มีพื้นที่สำหรับ CTA ด้านล่าง`;
}

function buildTrendSummary(trends: TrendSnapshotItem[]) {
  return trends.length
    ? trends.map((trend) => `${trend.label} (${trend.source})`).join(", ")
    : "อ้างอิงเทรนด์ไอทีล่าสุดจากระบบ";
}

export async function generatePostBrief(post: WeeklyPlanPost, trendRefs = post.trendRefs): Promise<GeneratedPostAsset> {
  return {
    generatedAt: new Date().toISOString(),
    caption: buildCaption(post, trendRefs),
    hashtags: [...hashtagsByType(post.postType), ...trendRefs.flatMap((trend) => trend.keywords.map((keyword) => `#${keyword.replace(/\s+/g, "")}`))].slice(0, 6),
    artworkBrief: `ภาพโพสต์ ${post.postType} สำหรับ ${post.productFocus} โดยโยงกับ ${buildTrendSummary(trendRefs)}`,
    artworkPrompt: buildArtworkPrompt(post, trendRefs),
    layoutIdea: "วางสินค้าเป็นภาพหลัก ด้านหนึ่งเป็น headline สั้น อีกด้านเป็น trend hook และมี CTA ชัดเจนด้านล่าง",
    promoText: post.cta,
    productNotes: `อ้างอิงสินค้า ${post.productFocus} (${post.productCode}) และเทรนด์ ${buildTrendSummary(trendRefs)}`,
    trendSummary: buildTrendSummary(trendRefs),
    trendSourceLabels: trendSourceLabels(trendRefs)
  };
}

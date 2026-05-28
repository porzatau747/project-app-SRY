import type { TrendContentPost, TrendSnapshotItem } from "../types/planner";

export function createPostFromNews(newsItem: TrendSnapshotItem, currentPostCount: number): TrendContentPost {
  return {
    id: `post-${Date.now()}`,
    day: `Day ${currentPostCount + 1}`,
    pillar: "Useful IT",
    contentType: "News Update",
    topic: newsItem.label,
    trendSignal: newsItem.label,
    memeType: "office meme",
    memeAngle: "",
    hook: `รู้หรือไม่? ${newsItem.label}`,
    contentBreakdown: [newsItem.summary || ""],
    bridgeContent: [],
    whyViral: "ข่าวสารไอทีที่น่าสนใจ",
    viralScore: 100,
    tier: "A Tier",
    suggestedFormat: "ภาพเดี่ยวหรืออัลบั้มสรุปข่าว",
    localFriendTone: "ภาษาเพื่อนเล่าข่าว เข้าใจง่าย ไม่ศัพท์แสงเยอะ",
    cta: "สนใจบริการปรึกษาเราได้เลย"
  };
}

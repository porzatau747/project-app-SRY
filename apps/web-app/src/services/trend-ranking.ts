import type { TrendSnapshotItem } from "../types/planner";

export const RECENT_WINDOW_DAYS = 62;

export const TOPIC_RULES = [
  {
    category: "AI" as const,
    keywords: ["ai", "เอไอ", "ปัญญาประดิษฐ์", "copilot", "agent", "llm", "gemini", "chatgpt", "automation"]
  },
  {
    category: "Windows / PC Pain" as const,
    keywords: ["windows", "pc", "คอม", "คอมพิวเตอร์", "ช้า", "ค้าง", "บั๊ก", "update", "อัปเดต", "ram", "ssd"]
  },
  {
    category: "RTX / PCGaming" as const,
    keywords: ["rtx", "geforce", "gpu", "การ์ดจอ", "เกม", "gaming", "gamer", "pc gaming", "steam"]
  },
  {
    category: "Notebook" as const,
    keywords: ["notebook", "laptop", "โน้ตบุ๊ก", "โน๊ตบุ๊ค", "แล็ปท็อป", "ultrabook"]
  },
  {
    category: "Office Productivity" as const,
    keywords: ["productivity", "office", "microsoft 365", "google workspace", "work", "ประชุม", "ทำงาน", "เอกสาร"]
  },
  {
    category: "Security / Smart Device" as const,
    keywords: ["security", "cyber", "privacy", "hack", "malware", "กล้อง", "smart", "iot", "router", "wifi", "wi-fi", "ความปลอดภัย"]
  }
];

export const VIRAL_KEYWORDS = [
  "ไวรัล",
  "ดราม่า",
  "มีม",
  "meme",
  "คนพูดถึง",
  "ฮิต",
  "กระแส",
  "แชร์",
  "แห่",
  "ถก",
  "trend",
  "tiktok",
  "facebook",
  "x",
  "social"
];

export const BIG_NEWS_KEYWORDS = [
  "เปิดตัว",
  "ประกาศ",
  "เตรียม",
  "หลุด",
  "อัปเดต",
  "ใหญ่",
  "ใหม่",
  "ราคา",
  "เริ่มขาย",
  "แบน",
  "ปิด",
  "รั่ว",
  "เตือน",
  "launch",
  "announce",
  "released",
  "update",
  "major",
  "new",
  "price",
  "leak",
  "warning",
  "breach"
];

export function daysOld(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)));
}

export function isRecent(value: string) {
  return daysOld(value) <= RECENT_WINDOW_DAYS;
}

export function inferCategory(text: string): TrendSnapshotItem["category"] {
  const lower = text.toLowerCase();
  const matched = TOPIC_RULES.find((rule) => rule.keywords.some((keyword) => lower.includes(keyword.toLowerCase())));
  return matched?.category ?? "General IT";
}

export function extractKeywords(text: string) {
  const lower = text.toLowerCase();
  const matches = new Set<string>();

  for (const rule of TOPIC_RULES) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword.toLowerCase())) matches.add(keyword);
    }
  }

  for (const keyword of VIRAL_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) matches.add(keyword);
  }

  return Array.from(matches).slice(0, 8);
}

export function includesAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword.toLowerCase()));
}

export function scoreTrend(item: { title: string; summary: string; publishedAt: string; sourceRegion: string }) {
  const text = `${item.title} ${item.summary}`;
  const age = daysOld(item.publishedAt);
  const category = inferCategory(text);
  const categoryScore = category === "General IT" ? 0 : 24;
  const thaiScore = item.sourceRegion === "TH" ? 18 : 8;
  const newsImpactScore = includesAny(text, BIG_NEWS_KEYWORDS) ? 18 : 6;
  const viralScore = includesAny(text, VIRAL_KEYWORDS) ? 14 : 0;
  const freshness = Math.max(12, 36 - Math.min(age, RECENT_WINDOW_DAYS));

  return Math.min(100, freshness + categoryScore + thaiScore + newsImpactScore + viralScore);
}

export function scoreInventoryAgainstTrend(name: string, trend: TrendSnapshotItem) {
  const lower = name.toLowerCase();
  let score = 0;

  for (const keyword of trend.keywords) {
    if (lower.includes(keyword.toLowerCase())) score += 18;
  }

  const categoryBoost: Record<TrendSnapshotItem["category"], string[]> = {
    AI: ["ai", "rtx", "gpu", "notebook", "pc"],
    "Windows / PC Pain": ["windows", "pc", "ram", "ssd", "notebook", "desktop", "คอม"],
    "RTX / PCGaming": ["gaming", "rtx", "mouse", "keyboard", "headset", "monitor", "vga", "gpu"],
    Notebook: ["notebook", "laptop", "macbook", "โน้ตบุ๊ก", "พกพา", "ทำงาน"],
    "Office Productivity": ["office", "print", "monitor", "mouse", "keyboard", "usb", "ทำงาน", "เอกสาร"],
    "Security / Smart Device": ["cctv", "router", "wifi", "smart", "iot", "กล้อง", "เน็ต"],
    "General IT": ["cable", "flashdrive", "power", "สาย", "อุปกรณ์"],
    "Tips & Tricks": ["tips", "trick", "how to", "วิธี", "แนะนำ", "สอน"]
  };

  for (const hint of categoryBoost[trend.category]) {
    if (lower.includes(hint)) score += 8;
  }

  return score;
}

import { readPlannerState } from "./storage";
import fs from "fs/promises";
import path from "path";
import type { MemeTrendSignal, TrendSnapshot, TrendSnapshotItem } from "../types/planner";
import { isRecent, includesAny, VIRAL_KEYWORDS, extractKeywords, inferCategory, scoreInventoryAgainstTrend } from "./trend-ranking";
import { normalizeItem, fetchFeed, FEEDS } from "./trend-fetcher";
import type { ParsedFeedItem } from "./trend-fetcher";

const TARGET_THAI_ITEMS = 6;
const TARGET_GLOBAL_ITEMS = 2;

const FALLBACK_SNAPSHOT: TrendSnapshot = {
  fetchedAt: "2026-05-18T00:00:00.000Z",
  generatedFrom: "fallback",
  headline: "ข่าว IT ใหญ่ที่เหมาะกับคอนเทนต์ร้านไอที",
  items: [
    {
      id: "fallback-th-ai-agent",
      label: "AI agent และผู้ช่วยทำงานอัตโนมัติกำลังเป็นกระแสหลัก",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://www.blognone.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 98,
      summary: "กระแส AI ในไทยยังแรงต่อเนื่อง โดยเฉพาะเครื่องมือช่วยทำงาน สรุปงาน และทำ automation ในชีวิตประจำวัน",
      keywords: ["AI", "agent", "automation", "productivity"],
      category: "AI"
    },
    {
      id: "fallback-th-windows-pain",
      label: "Windows / PC Pain: เครื่องช้า RAM ไม่พอ และอัปเดตที่คนบ่นบ่อย",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://www.techhub.in.th/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 95,
      summary: "ปัญหา PC ช้า Windows ค้าง และ RAM/SSD ไม่พอ เป็นหัวข้อที่คนเข้าใจง่ายและโยงกับบริการร้านได้ดี",
      keywords: ["Windows", "PC", "RAM", "SSD", "คอมช้า"],
      category: "Windows / PC Pain"
    },
    {
      id: "fallback-th-rtx-gaming",
      label: "RTX / PCGaming: เกมใหม่และการ์ดจอยังเป็นหัวข้อที่คนสนใจสูง",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://www.beartai.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 94,
      summary: "เกมใหม่ การ์ดจอ RTX และสเปก PC Gaming เป็นกระแสที่เชื่อมกับสินค้าเกมมิ่งได้ตรง",
      keywords: ["RTX", "GPU", "gaming", "เกม", "การ์ดจอ"],
      category: "RTX / PCGaming"
    },
    {
      id: "fallback-th-notebook",
      label: "Notebook สำหรับเรียน ทำงาน และเล่นเกมยังเป็นคอนเทนต์ซื้อจริง",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://droidsans.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 91,
      summary: "คำแนะนำเลือก Notebook ยังมี intent ซื้อสูง โดยเฉพาะช่วงเรียน ทำงาน และอัปเกรดอุปกรณ์",
      keywords: ["Notebook", "laptop", "โน้ตบุ๊ก", "RAM", "SSD"],
      category: "Notebook"
    },
    {
      id: "fallback-th-office",
      label: "Office Productivity: AI และเครื่องมือทำงานกลายเป็นเรื่องใกล้ตัว",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://www.it24hrs.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 89,
      summary: "คนทำงานสนใจเครื่องมือช่วยประชุม เอกสาร และ workflow มากขึ้น เหมาะกับคอนเทนต์ useful IT",
      keywords: ["Office", "productivity", "AI", "ประชุม", "เอกสาร"],
      category: "Office Productivity"
    },
    {
      id: "fallback-th-security-smart",
      label: "Security / Smart Device: กล้อง Wi-Fi Router และภัยไซเบอร์เป็น pain ใกล้ตัว",
      source: "Curated Thailand trend",
      sourceRegion: "TH",
      url: "https://www.it24hrs.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 88,
      summary: "ความปลอดภัยไซเบอร์ อุปกรณ์ smart device และเครือข่ายบ้านเป็นหัวข้อที่คนกลัวและถามต่อได้ง่าย",
      keywords: ["security", "smart", "Wi-Fi", "router", "กล้อง"],
      category: "Security / Smart Device"
    },
    {
      id: "fallback-global-ai",
      label: "AI features are becoming default across major software platforms",
      source: "Curated global trend",
      sourceRegion: "GLOBAL",
      url: "https://blog.google/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 86,
      summary: "Major global platforms keep adding AI features, giving local pages strong angles for explainers and memes.",
      keywords: ["AI", "productivity", "software"],
      category: "AI"
    },
    {
      id: "fallback-global-rtx",
      label: "RTX AI PC workflows connect gaming hardware with creator and AI use cases",
      source: "Curated global trend",
      sourceRegion: "GLOBAL",
      url: "https://blogs.nvidia.com/",
      publishedAt: "2026-05-18T00:00:00.000Z",
      score: 85,
      summary: "GPU and AI PC stories are useful for explaining why gaming hardware also matters for creators and local AI work.",
      keywords: ["RTX", "AI PC", "GPU", "gaming"],
      category: "RTX / PCGaming"
    }
  ]
};

function dedupeItems(items: TrendSnapshotItem[]) {
  const byKey = new Map<string, TrendSnapshotItem>();

  for (const item of items) {
    const key = item.label.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    const current = byKey.get(key);
    if (!current || current.score < item.score) byKey.set(key, item);
  }

  return Array.from(byKey.values());
}

function pickBalancedItems(items: TrendSnapshotItem[]) {
  const sorted = dedupeItems(items)
    .filter((item) => isRecent(item.publishedAt))
    .filter((item) => item.category !== "General IT")
    .filter((item) => item.score >= 58)
    .sort((a, b) => b.score - a.score || b.publishedAt.localeCompare(a.publishedAt));

  const thai = sorted.filter((item) => item.sourceRegion === "TH").slice(0, TARGET_THAI_ITEMS);
  const global = sorted.filter((item) => item.sourceRegion === "GLOBAL").slice(0, TARGET_GLOBAL_ITEMS);
  const selected = dedupeItems([...thai, ...global]);

  if (selected.length >= 6) return selected.slice(0, TARGET_THAI_ITEMS + TARGET_GLOBAL_ITEMS);

  const fallbackFill = dedupeItems([...selected, ...FALLBACK_SNAPSHOT.items])
    .sort((a, b) => b.score - a.score)
    .slice(0, TARGET_THAI_ITEMS + TARGET_GLOBAL_ITEMS);

  return fallbackFill;
}

function toSnapshot(items: ParsedFeedItem[], generatedFrom: TrendSnapshot["generatedFrom"]): TrendSnapshot {
  const normalized = items.map(normalizeItem);
  const selected = pickBalancedItems(normalized);

  return {
    fetchedAt: new Date().toISOString(),
    generatedFrom,
    headline: "ข่าว IT ใหญ่จากไทย 80% และต่างประเทศ 20%",
    items: selected.length ? selected : FALLBACK_SNAPSHOT.items
  };
}

function snapshotLooksUsable(snapshot: TrendSnapshot | null | undefined): snapshot is TrendSnapshot {
  return Boolean(snapshot?.items?.length);
}

function normalizeCachedSnapshot(snapshot: TrendSnapshot): TrendSnapshot {
  return {
    ...snapshot,
    items: snapshot.items.map((item) => {
      const legacyCategory = String(item.category);
      return {
        ...item,
        sourceRegion: item.sourceRegion ?? "TH",
        category:
          legacyCategory === "Windows"
            ? "Windows / PC Pain"
            : legacyCategory === "Gaming"
              ? "RTX / PCGaming"
              : legacyCategory === "Office"
                ? "Office Productivity"
                : legacyCategory === "Security"
                  ? "Security / Smart Device"
                  : item.category
      };
    })
  };
}

export async function getCurrentTrendSnapshot(): Promise<TrendSnapshot> {
  try {
    const dataPath = path.join(process.cwd(), "data", "rss_news.json");
    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const rssItems = data.items || [];

    const parsed = rssItems.map((item: any) => {
      return {
        id: item.id,
        label: item.title,
        source: item.source,
        sourceRegion: "TH",
        url: item.url,
        publishedAt: item.publishedAt,
        score: 100, // RSS feeds are implicitly valid
        summary: item.contentSnippet,
        keywords: extractKeywords(item.title + " " + item.contentSnippet),
        category: inferCategory(item.title + " " + item.contentSnippet),
        type: item.type
      } as TrendSnapshotItem;
    });

    if (parsed.length > 0) {
      return {
        fetchedAt: new Date().toISOString(),
        generatedFrom: "web" as const,
        headline: "อัปเดตข่าว IT ล่าสุดจากเว็บข่าว (ไม่รวมข่าวมือถือ)",
        items: parsed
      };
    }
  } catch (e) {
    console.error("Failed to read RSS data:", e);
  }

  const cached = await readPlannerState();
  if (snapshotLooksUsable(cached.lastTrendSnapshot)) {
    return {
      ...normalizeCachedSnapshot(cached.lastTrendSnapshot),
      fetchedAt: new Date().toISOString(),
      generatedFrom: "cache" as const
    };
  }

  return {
    ...FALLBACK_SNAPSHOT,
    fetchedAt: new Date().toISOString()
  };
}


export function buildMemeTrendSignals(snapshot: TrendSnapshot): MemeTrendSignal[] {
  const candidates = snapshot.items
    .filter((item) => item.sourceRegion === "TH")
    .filter((item) => isRecent(item.publishedAt))
    .map((item, index) => {
      const viralLift = includesAny(`${item.label} ${item.summary}`, VIRAL_KEYWORDS) ? 14 : 6;
      return {
        id: `meme-signal-${index}-${item.id}`,
        label:
          item.category === "AI"
            ? `(สั้น 50%) มีม AI: คนไทยแซว ${item.label}`
            : item.category === "Windows / PC Pain"
              ? `(สั้น 50%) มีมคอมช้า: ${item.label}`
              : item.category === "RTX / PCGaming"
                ? `(สั้น 50%) มีมเกมเมอร์: ${item.label}`
                : `(สั้น 50%) มีมไอทีไทย: ${item.label}`,
        source: item.source,
        url: item.url,
        publishedAt: item.publishedAt,
        score: Math.min(100, item.score + viralLift),
        summary: `(ย่อ 50%) สัญญาณมีมไทยล่าสุด: ${item.summary}`,
        keywords: Array.from(new Set([...item.keywords, "มีม", "ไวรัลไทย"])).slice(0, 8)
      } satisfies MemeTrendSignal;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (candidates.length) return candidates;

  return FALLBACK_SNAPSHOT.items
    .filter((item) => item.sourceRegion === "TH")
    .slice(0, 5)
    .map((item, index) => ({
      id: `fallback-meme-${index}`,
      label: `(สั้น 50%) มีมไอทีไทย: ${item.label}`,
      source: item.source,
      url: item.url,
      publishedAt: item.publishedAt,
      score: Math.min(100, item.score + 5),
      summary: `(ย่อ 50%) มีม fallback ไอทีไทยช่วงนี้: ${item.summary}`,
      keywords: Array.from(new Set([...item.keywords, "มีม", "ไวรัลไทย"])).slice(0, 8)
    }));
}

export function findRelatedTrends(input: string, snapshot: TrendSnapshot, limit = 3) {
  return [...snapshot.items]
    .map((item) => ({
      item,
      score: scoreInventoryAgainstTrend(input, item) + (item.summary.toLowerCase().includes(input.toLowerCase()) ? 10 : 0)
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.item.score - a.item.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function summarizeTrendSnapshot(snapshot: TrendSnapshot) {
  return snapshot.items
    .slice(0, 5)
    .map((item) => `- [${item.category}] ${item.label} (Score: ${item.score})`)
    .join("\n");
}

export { scoreInventoryAgainstTrend } from "./trend-ranking";

export function mergeTrendRefs(base: TrendSnapshotItem[], add: TrendSnapshotItem[]) {
  const byId = new Map<string, TrendSnapshotItem>();
  for (const item of base) byId.set(item.id, item);
  for (const item of add) byId.set(item.id, item);
  return Array.from(byId.values());
}

export function trendSourceLabels(trends: TrendSnapshotItem[]) {
  return Array.from(new Set(trends.map((item) => item.source)));
}

export function buildTrendLabelSummary(snapshot: TrendSnapshot) {
  return snapshot.items.map((item) => item.label).join(", ");
}

export function extractTrendKeywordsForMatching(snapshot: TrendSnapshot) {
  const set = new Set<string>();
  for (const item of snapshot.items) {
    for (const kw of item.keywords) {
      set.add(kw.toLowerCase());
    }
  }
  return Array.from(set);
}

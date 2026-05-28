# RSS News Integration Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Change the news source from Facebook Pages to 4 specific IT websites via RSS feeds, filter out mobile phone news, and revamp the Trend Planner UI to include a "News Repository" for manually selecting news into the 7-day calendar.

**Architecture:** Use `rss-parser` in the backend API to fetch and normalize feeds. Save the results to `data/rss_news.json`. Update the Trend Planner UI to display a list of news items and provide an "Add to Plan" button for each.

**Tech Stack:** Next.js API Routes, `rss-parser`, React Hooks

---

### Task 1: Backend RSS Integration

**Files:**
- Modify: `src/app/api/update-trends/route.ts`

**Step 1: Write the API Route implementation**

```typescript
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";

const parser = new Parser();

const RSS_FEEDS = [
  { url: "https://www.beartai.com/read-category/it-news/feed", source: "Beartai" },
  { url: "https://droidsans.com/category/news/feed", source: "Droidsans" },
  { url: "https://www.overclockzone.com/news/Varietytechnews/feed", source: "Overclockzone" },
  { url: "https://thaitechtoday.com/feed", source: "ThaiTechToday" }
];

const MOBILE_KEYWORDS = ["มือถือ", "สมาร์ทโฟน", "iphone", "samsung galaxy", "android", "ipad", "แท็บเล็ต", "tablet", "โทรศัพท์"];

function isMobileNews(text: string) {
  const lower = text.toLowerCase();
  return MOBILE_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function POST() {
  try {
    const allItems = [];

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items || []) {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          
          if (isMobileNews(title) || isMobileNews(content)) {
            continue; // Skip mobile news
          }

          allItems.push({
            id: `rss-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title,
            source: feed.source,
            url: item.link || "",
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            contentSnippet: content.substring(0, 500)
          });
        }
      } catch (err) {
        console.error(`Failed to fetch RSS for ${feed.source}:`, err);
      }
    }

    // Sort by newest
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const topItems = allItems.slice(0, 30);

    const dataPath = path.join(process.cwd(), "data", "rss_news.json");
    await fs.writeFile(dataPath, JSON.stringify({ items: topItems }, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: topItems.length });
  } catch (error: any) {
    console.error("RSS API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Task 2: Update Trend Services

**Files:**
- Modify: `src/services/trends.ts`

**Step 1: Update `getCurrentTrendSnapshot` to read `rss_news.json`**

```typescript
// Replace apify_fb_posts.json reading with rss_news.json
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
        score: 100, // RSS feeds are implicitly valid, score is not based on engagement anymore
        summary: item.contentSnippet,
        keywords: extractKeywords(item.title + " " + item.contentSnippet),
        category: inferCategory(item.title + " " + item.contentSnippet)
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
  // ... fallback to cached
}
```

### Task 3: Update `useTrendPlanner` hook

**Files:**
- Modify: `src/hooks/useTrendPlanner.ts`

**Step 1: Add `addNewsToPlan` function**

```typescript
import { generatePostBrief } from "../services/post-generator";

// Inside the hook:
  async function addNewsToPlan(newsItem: TrendSnapshotItem) {
    setAction({ loading: true, message: `กำลังสร้างโพสต์จากข่าว: ${newsItem.label}...`, error: "" });
    try {
      const generatedAsset = await generatePostBrief({
        id: `post-${Date.now()}`,
        day: "Pending",
        postType: "News",
        productFocus: "General IT",
        category: newsItem.category,
        reason: `อ้างอิงข่าว: ${newsItem.label}`,
        hook: `รู้หรือไม่? ${newsItem.label}`,
        contentAngle: "อัปเดตข่าวสารให้คนทั่วไปเข้าใจง่าย",
        cta: "แวะมาอัปเกรดคอมหรือปรึกษาปัญหาไอทีได้ที่ร้าน",
        trendRefs: [newsItem],
        viralScore: 100
      }, [newsItem]);

      const newPost: WeeklyPlanPost = {
        id: `post-${Date.now()}`,
        day: `Day ${plan.weeklyPlan.length + 1}`,
        postType: "News",
        productFocus: "General IT",
        productCode: "",
        category: newsItem.category,
        reason: `อ้างอิงข่าว: ${newsItem.label}`,
        hook: `รู้หรือไม่? ${newsItem.label}`,
        contentAngle: "อัปเดตข่าวสารให้คนทั่วไปเข้าใจง่าย",
        cta: "แวะมาอัปเกรดคอมหรือปรึกษาปัญหาไอทีได้ที่ร้าน",
        trendRefs: [newsItem],
        viralScore: 100,
        status: "generated",
        generatedAsset
      };

      setPlan(current => ({
        ...current,
        weeklyPlan: [...current.weeklyPlan, newPost]
      }));
      setAction({ loading: false, message: "เพิ่มข่าวลงปฏิทินสำเร็จ", error: "" });
    } catch (error) {
      setAction({ loading: false, message: "", error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
    }
  }

  // return { ..., addNewsToPlan }
```

### Task 4: UI Changes in `TrendPlannerApp.tsx`

**Files:**
- Modify: `src/app/trend-planner/TrendPlannerApp.tsx`

**Step 1: Remove "ตำแหน่งเพจ" and add "คลังข่าว"**

```tsx
// Remove the existing <div className="panel infoPanel"> ... </div>
// Add the News Repository panel

          <div className="panel">
            <h2>📰 คลังข่าว IT ล่าสุด (คลิกเพื่อเพิ่มลงปฏิทิน)</h2>
            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              {planner.plan.trendSnapshot.items.map((news) => (
                <div key={news.id} style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', margin: '0 0 8px 0' }}>{news.label}</h3>
                    <p style={{ margin: '0', fontSize: '14px', color: '#64748b' }}>แหล่งที่มา: {news.source} • หมวดหมู่: {news.category}</p>
                  </div>
                  <button 
                    className="secondaryButton" 
                    onClick={() => planner.addNewsToPlan(news)}
                    disabled={planner.action.loading}
                  >
                    + เพิ่มลงปฏิทิน 7 วัน
                  </button>
                </div>
              ))}
            </div>
          </div>
```

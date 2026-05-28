const fs = require('fs');
const path = require('path');

const trendsPath = path.join(__dirname, 'src', 'services', 'trends.ts');
let code = fs.readFileSync(trendsPath, 'utf8');

const newFunc = `export async function getCurrentTrendSnapshot(): Promise<TrendSnapshot> {
  const ALLOCATIONS = [
    { page: "comcraft.ds", limit: 4 },
    { page: "ExtremeITReview", limit: 2 },
    { page: "notebookspec", limit: 2 },
    { page: "overclockzonefanpage", limit: 2 }
  ];

  try {
    const dataPath = path.join(process.cwd(), "data", "apify_fb_posts.json");
    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const fbItems = data.items || [];

    // 1. Calculate engagement and normalize to 0-100 viral percentage
    const scoredItems = fbItems.map((item: any) => {
      const likes = parseInt(item.likes || item.reactionLikeCount || 0);
      const shares = parseInt(item.shares || 0);
      const comments = parseInt(item.comments || 0);
      const haha = parseInt(item.reactionHahaCount || 0);
      const love = parseInt(item.reactionLoveCount || 0);
      
      const engagement = likes + (shares * 5) + (comments * 3) + (haha * 2) + (love * 2);
      return { ...item, engagement };
    });

    const maxEngagement = Math.max(...scoredItems.map((i: any) => i.engagement), 1);
    
    const viralItems = scoredItems.map((item: any) => {
      const viralPercentage = Math.round((item.engagement / maxEngagement) * 100);
      return { ...item, viralPercentage };
    }).filter((item: any) => item.viralPercentage >= 50); // Keep only highly viral posts

    // Group items by pageName and sort them by time (newest first)
    const grouped: Record<string, any[]> = {};
    for (const item of viralItems) {
      const p = item.pageName || "";
      if (!grouped[p]) grouped[p] = [];
      grouped[p].push(item);
    }
    
    Object.values(grouped).forEach((list: any) => {
      list.sort((a: any, b: any) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
    });

    const selectedItems: any[] = [];
    
    // Pick based on allocation
    for (const alloc of ALLOCATIONS) {
      const list = grouped[alloc.page] || [];
      const toAdd = list.slice(0, alloc.limit);
      selectedItems.push(...toAdd);
    }

    const parsed = selectedItems.map((item: any, index: number) => {
      const text = item.text || "";
      const title = text ? text.substring(0, 100).replace(/\\n/g, " ") : "โพสต์ไม่มีข้อความ";
      
      return {
        id: \`apify-\${index}-\${item.postId || Date.now()}\`,
        label: title,
        source: item.pageName || "Facebook",
        sourceRegion: "TH",
        url: item.url || item.facebookUrl || "",
        publishedAt: item.time || new Date().toISOString(),
        score: item.viralPercentage,
        summary: text,
        keywords: extractKeywords(text),
        category: inferCategory(text)
      } as TrendSnapshotItem;
    });

    if (parsed.length > 0) {
      return {
        fetchedAt: new Date().toISOString(),
        generatedFrom: "web" as const,
        headline: "อัปเดตเทรนด์ไวรัล (>50%) จาก 4 เพจเป้าหมาย",
        items: parsed
      };
    }
  } catch (e) {
    console.error("Failed to read Apify data:", e);
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
}`;

code = code.replace(/export async function getCurrentTrendSnapshot\(\): Promise<TrendSnapshot> \{[\s\S]*?(?=export function buildMemeTrendSignals)/, newFunc + '\n\n');

fs.writeFileSync(trendsPath, code);
console.log("Updated trends.ts with viral filtering successfully.");

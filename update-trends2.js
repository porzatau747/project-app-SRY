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

    // Group items by pageName and sort them by time (newest first)
    const grouped = {};
    for (const item of fbItems) {
      if (!grouped[item.pageName]) grouped[item.pageName] = [];
      grouped[item.pageName].push(item);
    }
    
    Object.values(grouped).forEach(list => {
      list.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
    });

    const selectedItems = [];
    
    // Pick based on allocation
    for (const alloc of ALLOCATIONS) {
      const list = grouped[alloc.page] || [];
      const toAdd = list.slice(0, alloc.limit);
      selectedItems.push(...toAdd);
    }

    const parsed = selectedItems.map((item, index) => {
      const text = item.text || "";
      const title = text ? text.substring(0, 100).replace(/\\n/g, " ") : "โพสต์ไม่มีข้อความ";
      
      return {
        id: \`apify-\${index}-\${item.postId || Date.now()}\`,
        label: title,
        source: item.pageName || "Facebook",
        sourceRegion: "TH",
        url: item.url || item.facebookUrl || "",
        publishedAt: item.time || new Date().toISOString(),
        score: 100 - index,
        summary: text,
        keywords: extractKeywords(text),
        category: inferCategory(text)
      } as TrendSnapshotItem;
    });

    if (parsed.length > 0) {
      return {
        fetchedAt: new Date().toISOString(),
        generatedFrom: "web" as const,
        headline: "อัปเดตเทรนด์จาก Comcraft (40%), ExtremeIT (20%), Notebookspec (20%), Overclockzone (20%)",
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
console.log("Updated trends.ts successfully.");

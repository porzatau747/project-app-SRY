const fs = require('fs');
const path = require('path');

const trendsPath = path.join(__dirname, 'src', 'services', 'trends.ts');
let code = fs.readFileSync(trendsPath, 'utf8');

// Add fs/path imports if not exist
if (!code.includes('import fs from "fs/promises"')) {
  code = code.replace('import { readPlannerState } from "./storage";', 'import { readPlannerState } from "./storage";\nimport fs from "fs/promises";\nimport path from "path";');
}

// Replace getCurrentTrendSnapshot
const newFunc = `export async function getCurrentTrendSnapshot() {
  const APIFY_PAGES_ORDER = [
    "comcraft.ds",
    "ExtremeITReview",
    "notebookspec",
    "overclockzonefanpage",
    "CPUCore2Duo"
  ];

  try {
    const dataPath = path.join(process.cwd(), "data", "apify_fb_posts.json");
    const raw = await fs.readFile(dataPath, "utf-8");
    const data = JSON.parse(raw);
    const fbItems = data.items || [];

    // Sort by page order
    fbItems.sort((a, b) => {
      const pageA = APIFY_PAGES_ORDER.indexOf(a.pageName);
      const pageB = APIFY_PAGES_ORDER.indexOf(b.pageName);
      const pA = pageA === -1 ? 999 : pageA;
      const pB = pageB === -1 ? 999 : pageB;

      if (pA !== pB) return pA - pB;

      const timeA = new Date(a.time || 0).getTime();
      const timeB = new Date(b.time || 0).getTime();
      return timeB - timeA;
    });

    const parsed = fbItems.map((item, index) => {
      const text = item.text || "";
      const title = text ? text.substring(0, 100).replace(/\\n/g, " ") : "โพสต์ไม่มีข้อความ";
      
      return {
        id: \`apify-\${index}-\${item.postId || Date.now()}\`,
        label: title,
        source: item.pageName || "Facebook",
        sourceRegion: "TH",
        url: item.url || item.facebookUrl || "",
        publishedAt: item.time || new Date().toISOString(),
        score: 100 - (index % 50),
        summary: text,
        keywords: extractKeywords(text),
        category: inferCategory(text)
      };
    });

    // Pick top 15 (e.g. 3 from each page if evenly distributed)
    const selected = parsed.slice(0, 15);

    if (selected.length > 0) {
      return {
        fetchedAt: new Date().toISOString(),
        generatedFrom: "web",
        headline: "ข้อมูลอัปเดตล่าสุดจากเพจ IT (เรียงลำดับเพจเป้าหมาย)",
        items: selected
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
      generatedFrom: "cache"
    };
  }

  return {
    ...FALLBACK_SNAPSHOT,
    fetchedAt: new Date().toISOString()
  };
}`;

code = code.replace(/export async function getCurrentTrendSnapshot\(\) \{[\s\S]*?(?=export function buildMemeTrendSignals)/, newFunc + '\n\n');

fs.writeFileSync(trendsPath, code);
console.log("Updated trends.ts successfully.");

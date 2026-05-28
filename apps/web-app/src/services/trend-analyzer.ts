import type {
  CategoryOpportunity,
  InventoryItem,
  MemeLibraryItem,
  MemeTrendSignal,
  PostType,
  StockAnalysis,
  StockAnalysisItem,
  TrendContentPlan,
  TrendContentPost,
  TrendSnapshot,
  TrendSnapshotItem,
  WeeklyPlanPost
} from "../types/planner";
import {
  buildMemeTrendSignals,
  buildTrendLabelSummary,
  extractTrendKeywordsForMatching,
  findRelatedTrends,
  getCurrentTrendSnapshot,
  mergeTrendRefs,
  scoreInventoryAgainstTrend,
  summarizeTrendSnapshot
} from "./trends";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const thaiDays = ["วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์", "วันอาทิตย์"];
const postTypeMix: PostType[] = ["Sales", "Knowledge", "Meme", "Sales", "Engagement", "News", "Knowledge"];
const reminderTimes = ["09:30", "10:00", "11:30", "14:00", "15:30", "17:00", "19:00"];

function priorityFromAging(agingDays: number): StockAnalysisItem["priority"] {
  if (agingDays >= 240) return "urgent";
  if (agingDays >= 180) return "high";
  if (agingDays >= 120) return "medium";
  return "low";
}

function asAnalysisItem(item: InventoryItem, reason: string): StockAnalysisItem {
  const clearancePrefix = item.agingDays >= 180 && !/clearance/i.test(item.itemType) ? "Clearance / " : "";

  return {
    code: item.code,
    product: item.product,
    itemType: `${clearancePrefix}${item.itemType}`,
    reason,
    qty: item.qty,
    agingDays: item.agingDays,
    sellPrice: item.sellPrice,
    priority: priorityFromAging(item.agingDays)
  };
}

function buildTrendReason(trend: TrendSnapshotItem) {
  return `เชื่อมกับข่าว "${trend.label}" จาก ${trend.source} ในหมวด ${trend.category}`;
}

function fallbackAnalysis(inventory: InventoryItem[], trendSnapshot: TrendSnapshot): StockAnalysis {
  const ranked = [...inventory].sort((a, b) => b.agingDays - a.agingDays || b.stockValue - a.stockValue);
  const trendKeywords = extractTrendKeywordsForMatching(trendSnapshot);

  const pushItems = ranked
    .filter((item) => item.agingDays >= 90)
    .slice(0, 12)
    .map((item) =>
      asAnalysisItem(
        item,
        item.agingDays >= 180
          ? "สินค้า aging สูง ควรดันเป็นคอนเทนต์ Clearance, bundle หรือโปรเร่งตัดสินใจ"
          : "สินค้าเริ่มค้างสต็อก เหมาะกับโพสต์ให้ความรู้หรือเทียบรุ่นเพื่อกระตุ้นความสนใจก่อนขายตรง"
      )
    );

  const dyingItems = ranked
    .filter((item) => item.agingDays >= 180)
    .slice(0, 10)
    .map((item) => asAnalysisItem(item, "สินค้าค้างนาน ควรจัดเป็น Clearance หรือ bundle เพื่อลดแรงกดสต็อก"));

  const trendMatches = ranked
    .map((item) => ({
      item,
      score: trendSnapshot.items.reduce(
        (best, trend) => Math.max(best, scoreInventoryAgainstTrend(`${item.product} ${item.itemType} ${item.code}`, trend)),
        0
      )
    }))
    .filter((entry) => entry.score > 10 || trendKeywords.some((keyword: string) => `${entry.item.product} ${entry.item.itemType}`.toLowerCase().includes(keyword)))
    .sort((a, b) => b.score - a.score || b.item.agingDays - a.item.agingDays)
    .slice(0, 10)
    .map(({ item }) => {
      const trend = findRelatedTrends(`${item.product} ${item.itemType}`, trendSnapshot, 1)[0] ?? trendSnapshot.items[0];
      return asAnalysisItem(item, buildTrendReason(trend));
    });

  const categoryMap = new Map<string, { qty: number; totalAging: number; value: number; sampleName: string }>();
  for (const item of inventory) {
    const current = categoryMap.get(item.itemType) ?? { qty: 0, totalAging: 0, value: 0, sampleName: item.product };
    current.qty += item.qty;
    current.totalAging += item.agingDays;
    current.value += item.stockValue;
    categoryMap.set(item.itemType, current);
  }

  const categoryOpportunities = Array.from(categoryMap.entries())
    .map(([category, value]) => {
      const averageAging = Math.round(value.totalAging / Math.max(value.qty, 1));
      const relatedTrend = findRelatedTrends(`${category} ${value.sampleName}`, trendSnapshot, 1)[0];

      return {
        category: averageAging >= 180 && !/clearance/i.test(category) ? `Clearance / ${category}` : category,
        reason: `มีสินค้า ${value.qty} ชิ้น อายุเฉลี่ย ${averageAging} วัน`,
        suggestedAngle: relatedTrend
          ? `โยงกับข่าว ${relatedTrend.label} แล้วเล่าในมุม ${relatedTrend.category}`
          : averageAging >= 180
            ? "ทำโพสต์ Clearance แบบคุ้มค่า จำนวนจำกัด หรือ bundle"
            : "ทำโพสต์ให้ความรู้ เปรียบเทียบ หรือแนะนำวิธีเลือกให้เหมาะกับการใช้งานจริง",
        priority: averageAging >= 180 ? "high" : averageAging >= 90 ? "medium" : "low"
      } satisfies CategoryOpportunity;
    })
    .sort((a, b) => (b.priority === "high" ? 1 : 0) - (a.priority === "high" ? 1 : 0))
    .slice(0, 8);

  return {
    generatedAt: new Date().toISOString(),
    trendKeywords,
    trendSnapshot,
    pushItems,
    dyingItems,
    trendMatches,
    categoryOpportunities,
    summary: `ใช้ข่าว IT ล่าสุดจากเว็บ ${trendSnapshot.items.length} หัวข้อ: ${summarizeTrendSnapshot(trendSnapshot)}`
  };
}

function chooseSourceItems(analysis: StockAnalysis) {
  const byCode = new Map<string, StockAnalysisItem>();
  for (const item of [...analysis.dyingItems, ...analysis.pushItems, ...analysis.trendMatches]) {
    if (!byCode.has(item.code)) byCode.set(item.code, item);
  }
  return Array.from(byCode.values());
}

import { postTemplate, memeTypeForTrend, contentTypeForPillar } from "./content-templates";

function buildWeeklyPost(item: StockAnalysisItem, index: number, analysis: StockAnalysis): WeeklyPlanPost {
  const postType = postTypeMix[index];
  const template = postTemplate(postType, item.product);
  const trendRefs = mergeTrendRefs(findRelatedTrends(`${item.product} ${item.itemType}`, analysis.trendSnapshot), []);
  const primaryTrend = trendRefs[0];
  const trendSentence = primaryTrend
    ? `โยงกับข่าว "${primaryTrend.label}" จาก ${primaryTrend.source}`
    : "ยึดตามสัญญาณข่าว IT ล่าสุด";

  return {
    id: `post-${index + 1}`,
    day: days[index],
    category: postType === "Sales" && item.agingDays >= 180 && !/clearance/i.test(item.itemType) ? `Clearance / ${item.itemType}` : item.itemType,
    postType,
    productFocus: item.product,
    productCode: item.code,
    reason: `${template.angle} โดย ${trendSentence} และยังคุมไม่ให้หน้าเพจขายติดกัน`,
    contentAngle: template.angle,
    hook: template.hook,
    cta: template.cta,
    priority: item.priority,
    status: "draft",
    reminderAt: reminderTimes[index],
    trendRefs
  };
}

function trendPlanTemplate(snapshot: TrendSnapshot, memeSignals: MemeTrendSignal[]): TrendContentPost[] {
  const items = snapshot.items.length ? snapshot.items : [];
  const pillarCycle = ["Meme + Trend", "Useful IT", "Meme + Trend", "Useful IT", "Product / Promotion", "Local / Human Content", "Product / Promotion"] as const;

  return thaiDays.map((day, index) => {
    const trend = items[index % items.length];
    const memeSignal = memeSignals[index % Math.max(memeSignals.length, 1)];
    const pillar = pillarCycle[index];
    const memeAngle =
      pillar === "Meme + Trend"
        ? `ขยี้มีมฮิต "${memeSignal?.label ?? "มีม"}" คู่เทรนด์ "${trend?.label ?? "ข่าว IT"}" แบบสั้นๆ`
        : `สรุป "${trend?.label ?? "ข่าว IT"}" สั้นกระชับ 3 บรรทัด`;

    return {
      id: `trend-post-${index + 1}`,
      day,
      pillar,
      contentType: contentTypeForPillar(pillar),
      topic: trend?.label ? `สรุปประเด็นด่วน: ${trend.label}` : `กระแส IT ด่วนประจำวัน`,
      trendSignal: trend?.summary ? `${trend.summary.substring(0, 100)}... (เน้นใจความสำคัญ)` : "สรุปกระแส IT สั้นกระชับ",
      memeType: memeTypeForTrend(trend),
      memeAngle,
      hook: `สรุปด่วน! ${trend?.label ?? "เทรนด์ IT"} รู้ไว้ไม่ตกเทรนด์`,
      contentBreakdown: [
        `พาดหัวสรุปข่าว ${trend?.source ?? "IT"} ใน 1 บรรทัด`,
        "จับประเด็นใจความสำคัญสั้นๆ",
        "โยงเข้าสินค้าแบบแนบเนียน"
      ],
      bridgeContent: [
        `Topic: ${trend?.label ?? "เทรนด์"}`,
        `Angle: สรุปสั้น กระชับ`,
        "Action: อ่านจบปุ๊บรู้เรื่องปั๊บ"
      ],
      whyViral: "สั้น กระชับ ตรงประเด็น ทันเหตุการณ์ (อ่านจบใน 15 วิ)",
      viralScore: Math.max(72, Math.round(((trend?.score ?? 72) + (memeSignal?.score ?? 72)) / 2)),
      tier: (trend?.score ?? 0) >= 90 ? "S Tier" : "A Tier",
      suggestedFormat: pillar === "Meme + Trend" ? "short video" : "1-image summary",
      localFriendTone: "เพื่อนไอทีสรุปข่าวให้ฟังใน 1 นาที",
      cta: "เมนต์มาเลย / แท็กเพื่อนมาดู"
    };
  });
}

function buildMemeLibrary(snapshot: TrendSnapshot, memeSignals: MemeTrendSignal[]): MemeLibraryItem[] {
  const signalLabels = memeSignals.map((signal) => signal.label).slice(0, 5);
  const aiTrend = snapshot.items.find((item) => item.category === "AI");
  const windowsTrend = snapshot.items.find((item) => item.category === "Windows / PC Pain");
  const gamingTrend = snapshot.items.find((item) => item.category === "RTX / PCGaming");
  const officeTrend = snapshot.items.find((item) => item.category === "Office Productivity");

  return [
    {
      type: "reaction meme",
      useWhen: "(ย่อ 50%) ใช้กับอาการคอมค้าง/พัง อิงกระแสคนไทย",
      exampleAngles: [windowsTrend?.label ?? "Task Manager ค้าง", "คอมอัปเดตตอนรีบ"],
      matchedNewsAngles: signalLabels.length ? signalLabels : ["คอมช้า", "RAM ไม่พอ"]
    },
    {
      type: "nostalgia meme",
      useWhen: "(ย่อ 50%) ชวนคุยของไอทีเก่าที่คนไทยคุ้นเคย",
      exampleAngles: ["เสียงบูตเครื่องยุค 90", "ไอเทมในตำนาน"],
      matchedNewsAngles: signalLabels.length ? signalLabels : ["retro tech", "throwback"]
    },
    {
      type: "gamer meme",
      useWhen: "(ย่อ 50%) แซวเกมเมอร์ไทย งบน้อยแต่เกมกินสเปก",
      exampleAngles: [gamingTrend?.label ?? "เกมใหม่กินสเปก", "จอ 144Hz สบายตา"],
      matchedNewsAngles: [gamingTrend?.label ?? "PCGaming", "GPU"]
    },
    {
      type: "office meme",
      useWhen: "(ย่อ 50%) แซวชาวออฟฟิศไทย ไฟล์บิน ไมค์ดับ",
      exampleAngles: [officeTrend?.label ?? "ไฟล์ค้างก่อนส่ง", "ประชุมไมค์พัง"],
      matchedNewsAngles: [officeTrend?.label ?? "มนุษย์ออฟฟิศ", "hybrid work"]
    },
    {
      type: "AI meme",
      useWhen: "(ย่อ 50%) แซว AI ที่เจอในทุกแอปของไทย",
      exampleAngles: [aiTrend?.label ?? "AI ไม่ช่วยงานที่ให้ช่วย", "ทุกแอปมี AI"],
      matchedNewsAngles: [aiTrend?.label ?? "AI", "Copilot"]
    }
  ];
}

export async function analyzeStockForContent(inventory: InventoryItem[], existingSnapshot?: TrendSnapshot | null) {
  const trendSnapshot = existingSnapshot?.items?.length ? existingSnapshot : await getCurrentTrendSnapshot();
  return fallbackAnalysis(inventory, trendSnapshot);
}

export function generateWeeklyPlan(analysis: StockAnalysis): WeeklyPlanPost[] {
  const sourceItems = chooseSourceItems(analysis);
  const fallbackItems = sourceItems.length
    ? sourceItems
    : analysis.categoryOpportunities.map(
        (item, index) =>
          ({
            code: `category-${index}`,
            product: item.category,
            itemType: item.category,
            reason: item.suggestedAngle,
            qty: 1,
            agingDays: item.priority === "high" ? 180 : 90,
            sellPrice: null,
            priority: item.priority === "high" ? "high" : "medium"
          }) satisfies StockAnalysisItem
      );

  return days.map((_, index) => buildWeeklyPost(fallbackItems[index % fallbackItems.length], index, analysis));
}

export function addSinglePost(itemCode: string, analysis: StockAnalysis, currentPlan: WeeklyPlanPost[], inventory?: InventoryItem[]): WeeklyPlanPost | null {
  const sourceItems = [...analysis.dyingItems, ...analysis.pushItems, ...analysis.trendMatches];
  let matchedItem = sourceItems.find(item => item.code === itemCode);

  if (!matchedItem && inventory) {
    const invItem = inventory.find(i => i.code === itemCode);
    if (invItem) {
      matchedItem = {
        code: invItem.code,
        product: invItem.product,
        itemType: invItem.itemType,
        reason: "ถูกเลือกโดยตรงจากคลังสินค้า",
        qty: invItem.qty,
        agingDays: invItem.agingDays,
        sellPrice: invItem.sellPrice,
        priority: "medium"
      };
    }
  }

  if (!matchedItem) return null;

  // Find a day with the fewest posts to balance the calendar
  const postCounts = days.reduce((acc, day) => {
    acc[day] = currentPlan.filter(post => post.day === day).length;
    return acc;
  }, {} as Record<string, number>);
  
  const targetDay = days.reduce((a, b) => postCounts[a] <= postCounts[b] ? a : b);
  const nextIndex = currentPlan.length;

  const post = buildWeeklyPost(matchedItem, nextIndex % postTypeMix.length, analysis);
  post.day = targetDay;
  post.id = `post-${Date.now()}`;
  return post;
}

export async function generateTrendContentPlan(existingSnapshot?: TrendSnapshot | null): Promise<TrendContentPlan> {
  const trendSnapshot = existingSnapshot?.items?.length ? existingSnapshot : await getCurrentTrendSnapshot();
  const memeSignals = buildMemeTrendSignals(trendSnapshot);
  const weeklyPosts = trendPlanTemplate(trendSnapshot, memeSignals);

  return {
    generatedAt: new Date().toISOString(),
    trendSnapshot,
    memeSignals,
    positioning: "เพื่อนสายไอทีของคนในพื้นที่ ไม่ใช่เพจข่าว แต่แปลข่าวใหญ่ให้เอาไปใช้และซื้อของได้ง่ายขึ้น",
    trendSourcesNote: `อัปเดตจาก ${trendSnapshot.generatedFrom} เมื่อ ${new Date(trendSnapshot.fetchedAt).toLocaleString("th-TH")} โดยตั้งใจให้น้ำหนักข่าวไทยประมาณ 80% และข่าวต่างประเทศประมาณ 20%`,
    strategySummary: `ใช้ข่าว IT ใหญ่จากไทยเป็นหลัก แล้ว bridge ไปสู่ useful content, meme, product story และ local store voice: ${buildTrendLabelSummary(trendSnapshot)}`,
    contentRatio: [
      { pillar: "Meme + Trend", percent: 40, weeklySlots: 3 },
      { pillar: "Useful IT", percent: 30, weeklySlots: 2 },
      { pillar: "Product / Promotion", percent: 20, weeklySlots: 1 },
      { pillar: "Local / Human Content", percent: 10, weeklySlots: 1 }
    ],
    categoryFocus: [
      { tier: "S Tier", category: "AI", reason: "กระแสแรงและเล่าได้ทั้งมุมมีม เครื่องมือทำงาน และสินค้า IT" },
      { tier: "S Tier", category: "Windows / PC Pain", reason: "เป็นปัญหาใกล้ตัวที่คนไทยคอมเมนต์ง่ายและโยงบริการร้านได้ชัด" },
      { tier: "S Tier", category: "RTX / PCGaming", reason: "เชื่อมกับการ์ดจอ เกม อุปกรณ์เกมมิ่ง และ AI PC ได้ตรง" },
      { tier: "A Tier", category: "Notebook", reason: "มี intent ซื้อสูง เหมาะกับคอนเทนต์เลือกเครื่อง เทียบรุ่น และโปร" },
      { tier: "A Tier", category: "Office Productivity", reason: "เหมาะกับลูกค้าทำงานและคอนเทนต์ practical ที่เซฟเก็บได้" },
      { tier: "A Tier", category: "Security / Smart Device", reason: "เล่าได้ทั้งความรู้ ภัยใกล้ตัว และสินค้าแก้ pain เช่น Router, Wi-Fi, กล้อง และ Smart device" }
    ],
    memeLibrary: buildMemeLibrary(trendSnapshot, memeSignals),
    weeklyPosts
  };
}

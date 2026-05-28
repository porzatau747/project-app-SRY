export type InventoryItem = {
  itemType: string;
  code: string;
  product: string;
  serial: string;
  qty: number;
  agingDays: number;
  agingBucket: string;
  store: string;
  cost: number;
  sellPrice: number | null;
  stockValue: number;
  projectedRevenue: number | null;
  margin: number | null;
};

export type InventorySummary = {
  sourcePriceFile: string;
  sourceStockFile: string;
  generatedAt: string;
  totalSku: number;
  totalSerialItems: number;
  totalQty: number;
  totalStockValue: number;
  totalProjectedRevenue: number;
  missingPriceCount: number;
  agingBuckets: Array<{
    bucket: string;
    qty: number;
    value: number;
  }>;
};

export type TrendInput = {
  keywords: string[];
};

export type TrendSnapshotItem = {
  id: string;
  label: string;
  source: string;
  sourceRegion: "TH" | "GLOBAL";
  url: string;
  publishedAt: string;
  score: number;
  summary: string;
  keywords: string[];
  type?: "news" | "tip";
  category:
    | "AI"
    | "Windows / PC Pain"
    | "RTX / PCGaming"
    | "Notebook"
    | "Office Productivity"
    | "Security / Smart Device"
    | "General IT";
};

export type TrendSnapshot = {
  fetchedAt: string;
  generatedFrom: "web" | "cache" | "fallback";
  headline: string;
  items: TrendSnapshotItem[];
};

export type MemeTrendSignal = {
  id: string;
  label: string;
  source: string;
  url: string;
  publishedAt: string;
  score: number;
  summary: string;
  keywords: string[];
};

export type StockAnalysisItem = {
  code: string;
  product: string;
  itemType: string;
  reason: string;
  qty: number;
  agingDays: number;
  sellPrice: number | null;
  priority: "low" | "medium" | "high" | "urgent";
};

export type CategoryOpportunity = {
  category: string;
  reason: string;
  suggestedAngle: string;
  priority: "low" | "medium" | "high";
};

export type StockAnalysis = {
  generatedAt: string;
  trendKeywords: string[];
  trendSnapshot: TrendSnapshot;
  pushItems: StockAnalysisItem[];
  dyingItems: StockAnalysisItem[];
  trendMatches: StockAnalysisItem[];
  categoryOpportunities: CategoryOpportunity[];
  summary: string;
};

export type WeeklyPlanStatus = "draft" | "approved" | "generated";
export type PostType = "Sales" | "Meme" | "Knowledge" | "Engagement" | "News";

export type WeeklyPlanPost = {
  id: string;
  day: string;
  category: string;
  postType: PostType;
  productFocus: string;
  productCode: string;
  reason: string;
  contentAngle: string;
  hook: string;
  cta: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: WeeklyPlanStatus;
  reminderAt: string;
  trendRefs: TrendSnapshotItem[];
  generatedAsset?: GeneratedPostAsset;
};

export type GeneratedPostAsset = {
  generatedAt: string;
  caption: string;
  hashtags: string[];
  artworkBrief: string;
  artworkPrompt: string;
  layoutIdea: string;
  promoText: string;
  productNotes: string;
  trendSummary: string;
  trendSourceLabels: string[];
};

export type PlannerState = {
  inventory: InventoryItem[];
  summary: InventorySummary | null;
  lastTrendSnapshot: TrendSnapshot | null;
  analysis: StockAnalysis | null;
  weeklyPlan: WeeklyPlanPost[];
};

export type TrendContentPillar =
  | "Meme + Trend"
  | "Useful IT"
  | "Product / Promotion"
  | "Local / Human Content";

export type MemeLibraryType = "reaction meme" | "nostalgia meme" | "gamer meme" | "office meme" | "AI meme";
export type TrendTier = "S Tier" | "A Tier" | "B Tier";

export type TrendContentPost = {
  id: string;
  day: string;
  pillar: TrendContentPillar;
  contentType: string;
  topic: string;
  trendSignal: string;
  memeType: MemeLibraryType;
  memeAngle: string;
  hook: string;
  contentBreakdown: string[];
  bridgeContent: string[];
  whyViral: string;
  viralScore: number;
  tier: TrendTier;
  suggestedFormat: string;
  localFriendTone: string;
  cta: string;
};

export type MemeLibraryItem = {
  type: MemeLibraryType;
  useWhen: string;
  exampleAngles: string[];
  matchedNewsAngles: string[];
};

export type TrendContentPlan = {
  generatedAt: string;
  trendSnapshot: TrendSnapshot;
  memeSignals: MemeTrendSignal[];
  positioning: string;
  trendSourcesNote: string;
  strategySummary: string;
  contentRatio: Array<{
    pillar: TrendContentPillar;
    percent: number;
    weeklySlots: number;
  }>;
  categoryFocus: Array<{
    tier: TrendTier;
    category: string;
    reason: string;
  }>;
  memeLibrary: MemeLibraryItem[];
  weeklyPosts: TrendContentPost[];
};

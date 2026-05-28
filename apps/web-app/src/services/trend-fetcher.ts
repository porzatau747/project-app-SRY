import { scoreTrend, inferCategory, extractKeywords } from "./trend-ranking";
import type { TrendSnapshotItem } from "../types/planner";

export type FeedConfig = {
  source: string;
  sourceRegion: "TH" | "GLOBAL";
  url: string;
  itemTag: "item" | "entry";
};

export type ParsedFeedItem = {
  title: string;
  url: string;
  publishedAt: string;
  summary: string;
  source: string;
  sourceRegion: "TH" | "GLOBAL";
};

export const FEEDS: FeedConfig[] = [
  { source: "iHAVECPU", sourceRegion: "TH", url: "https://www.ihavecpu.com/feed/", itemTag: "item" },
  { source: "DroidSans", sourceRegion: "TH", url: "https://droidsans.com/feed/", itemTag: "item" },
  { source: "Extreme IT", sourceRegion: "TH", url: "https://www.extremeit.com/feed/", itemTag: "item" },
  { source: "Overclockzone", sourceRegion: "TH", url: "https://overclockzone.com/feed/", itemTag: "item" },
  { source: "notebookspec", sourceRegion: "TH", url: "https://notebookspec.com/web/feed/", itemTag: "item" }
];

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function readTag(block: string, tag: string) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  return decodeEntities(block.match(pattern)?.[1] ?? "");
}

function readLink(block: string) {
  const atomHref = block.match(/<link[^>]*href="([^"]+)"[^>]*\/?>/i)?.[1];
  if (atomHref) return atomHref.trim();
  return readTag(block, "link").trim();
}

function normalizeDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export function parseFeed(xml: string, config: FeedConfig): ParsedFeedItem[] {
  const blockPattern = new RegExp(`<${config.itemTag}\\b[\\s\\S]*?<\\/${config.itemTag}>`, "gi");
  const blocks = xml.match(blockPattern) ?? [];

  return blocks
    .map((block) => {
      const title = readTag(block, "title");
      const url = readLink(block);
      const publishedAt = normalizeDate(
        readTag(block, "pubDate") || readTag(block, "published") || readTag(block, "updated")
      );
      const summary = readTag(block, "description") || readTag(block, "summary") || readTag(block, "content");

      return {
        title,
        url,
        publishedAt,
        summary,
        source: config.source,
        sourceRegion: config.sourceRegion
      };
    })
    .filter((item) => item.title && item.url);
}

export async function fetchFeed(config: FeedConfig): Promise<ParsedFeedItem[]> {
  const response = await fetch(config.url, {
    headers: { "User-Agent": "weekly-content-planner/1.0" },
    signal: AbortSignal.timeout(8000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`${config.source} feed request failed`);

  return parseFeed(await response.text(), config);
}

export function normalizeItem(item: ParsedFeedItem, index: number): TrendSnapshotItem {
  const text = `${item.title} ${item.summary}`;
  return {
    id: `trend-${index}-${item.source.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: item.title,
    source: item.source,
    sourceRegion: item.sourceRegion,
    url: item.url,
    publishedAt: item.publishedAt,
    score: scoreTrend(item),
    summary: item.summary || item.title,
    keywords: extractKeywords(text),
    category: inferCategory(text)
  };
}

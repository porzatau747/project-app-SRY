import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import Parser from "rss-parser";
import OpenAI from "openai";
import { scrapeThaiwareTips, scrapeBeartaiNews, scrapeOverclockzoneNews } from "../../../services/custom-scrapers";
const parser = new Parser();

const RSS_FEEDS = [
  { url: "https://droidsans.com/category/news/feed", source: "Droidsans" },
  { url: "https://thaitechtoday.com/feed", source: "ThaiTechToday" }
];

const MOBILE_KEYWORDS = ["มือถือ", "สมาร์ทโฟน", "iphone", "samsung galaxy", "android", "ipad", "แท็บเล็ต", "tablet", "โทรศัพท์", "สมาร์ตโฟน"];
const IT_KEYWORDS = ["pc", "คอมพิวเตอร์", "โน้ตบุ๊ก", "laptop", "การ์ดจอ", "cpu", "แรม", "เกมมิ่ง", "ปริ้นเตอร์", "router", "ai", "ซอฟต์แวร์", "windows", "rtx", "hardware", "เมนบอร์ด", "คอม", "จอ"];

function isAdviceRelevantFallback(title: string, snippet: string) {
  const lower = (title + " " + snippet).toLowerCase();
  const hasMobile = MOBILE_KEYWORDS.some((kw) => lower.includes(kw));
  const hasIT = IT_KEYWORDS.some((kw) => lower.includes(kw));
  return hasIT && !hasMobile;
}

import type { ScrapedItem } from "../../../services/custom-scrapers";

async function filterAdviceRelevantNewsWithAI(items: ScrapedItem[]): Promise<boolean[]> {
  if (!process.env.GEMINI_API_KEY || items.length === 0) {
    console.log("No GEMINI_API_KEY found or empty items, using fallback keyword filtering.");
    return items.map((item) => isAdviceRelevantFallback(item.title, item.contentSnippet));
  }

  try {
    const openai = new OpenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
    const payload = items.map((item, index) => `${index}. ${item.title}`).join("\n");
    
    const prompt = `You are a strict news filter for an IT retail store (Advice IT) which sells computers, laptops, PC hardware, gaming gear, printers, networking, AI tech, and software.
I will give you a list of news titles.
You must return a valid JSON object with a single key "results" which contains an array of booleans (e.g. {"results": [true, false, true]}).
Return 'true' IF AND ONLY IF the news is about products sold at Advice (Computers, Laptops, PC Hardware, Gaming Gear, Monitors, Printers, Networking, Software, AI tech).
Return 'false' IF the news is about mobile phones, smartphones, tablets, mobile operating systems (iOS/Android), mobile phone brands, OR unrelated topics (cars, lifestyle, non-IT).
Length of the array must be exactly ${items.length}.

Input:
${payload}`;

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (content) {
      const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      if (parsed.results && Array.isArray(parsed.results) && parsed.results.length === items.length) {
        return parsed.results;
      }
    }
  } catch(e: unknown) {
    console.error("AI filter failed, falling back", e instanceof Error ? e.message : e);
  }
  return items.map((item) => isAdviceRelevantFallback(item.title, item.contentSnippet));
}

export async function POST() {
  try {
    let rawItems: ScrapedItem[] = [];

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of parsed.items || []) {
          const title = item.title || "";
          const contentSnippet = item.contentSnippet || item.content || "";

          rawItems.push({
            id: `rss-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title,
            source: feed.source,
            url: item.link || "",
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            contentSnippet: contentSnippet.substring(0, 500),
            type: "news"
          });
        }
      } catch (err: unknown) {
        console.error(`Failed to fetch RSS for ${feed.source}:`, err instanceof Error ? err.message : err);
      }
    }

    const twTips = await scrapeThaiwareTips();
    const btNews = await scrapeBeartaiNews();
    const oczNews = await scrapeOverclockzoneNews();
    
    rawItems.push(...twTips, ...btNews, ...oczNews);
    // AI Filter
    const isRelevantArray = await filterAdviceRelevantNewsWithAI(rawItems);
    
    // Filter to keep only relevant news (true)
    const filteredItems = rawItems.filter((_, index) => isRelevantArray[index]);

    // Sort by newest
    filteredItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    const topItems = filteredItems.slice(0, 40);

    const dataPath = path.join(process.cwd(), "data", "rss_news.json");
    await fs.writeFile(dataPath, JSON.stringify({ items: topItems }, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: topItems.length });
  } catch (error: unknown) {
    console.error("Trend update error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Failed to update trends" }, { status: 500 });
  }
}

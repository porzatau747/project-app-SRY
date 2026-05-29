import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const FB_PAGES = [
  { url: "https://www.facebook.com/comcraft.ds", source: "comcraft.ds" },
  { url: "https://www.facebook.com/techhub.arip", source: "techhub.arip" },
  { url: "https://www.facebook.com/notebookspec", source: "notebookspec" },
  { url: "https://www.facebook.com/overclockzonefanpage", source: "overclockzonefanpage" }
];

const MOBILE_KEYWORDS = ["มือถือ", "สมาร์ทโฟน", "iphone", "samsung galaxy", "android", "ipad", "แท็บเล็ต", "tablet", "โทรศัพท์", "สมาร์ตโฟน"];
const IT_KEYWORDS = ["pc", "คอมพิวเตอร์", "โน้ตบุ๊ก", "laptop", "การ์ดจอ", "cpu", "แรม", "เกมมิ่ง", "ปริ้นเตอร์", "router", "ai", "ซอฟต์แวร์", "windows", "rtx", "hardware", "เมนบอร์ด", "คอม", "จอ"];

function isAdviceRelevantFallback(title: string, snippet: string) {
  const lower = (title + " " + snippet).toLowerCase();
  const hasMobile = MOBILE_KEYWORDS.some((kw) => lower.includes(kw));
  const hasIT = IT_KEYWORDS.some((kw) => lower.includes(kw));
  return hasIT && !hasMobile;
}

export type ScrapedItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  contentSnippet: string;
  type: "news" | "tip";
};

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
    const payload = items.map((item, index) => `${index}. ${item.contentSnippet}`).join("\n\n---\n\n");
    const prompt = `You are a strict news filter for an IT retail store (Advice IT) which sells computers, laptops, PC hardware, gaming gear, printers, networking, AI tech, and software.
I will give you a list of news posts, including their full text and engagement numbers (likes, comments, shares) at the bottom.
You must return a valid JSON object with a single key "results" which contains an array of booleans (e.g. {"results": [true, false, true]}).
Return 'true' IF AND ONLY IF the post meets BOTH of these conditions:
1. It is about products sold at Advice (Computers, Laptops, PC Hardware, Gaming Gear, Monitors, Printers, Networking, Software, AI tech). Do not accept mobile phones, smartphones, tablets, or non-IT topics.
2. It has "good engagement" (กระแสดี) based on the numbers in the text compared to typical posts. Look for high like, comment, or share numbers.
Return 'false' if it fails either condition.
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
  let browser = null;
  try {
    const isLocal = process.env.NODE_ENV === "development";
    const executablePath = isLocal 
      ? process.env.CHROME_EXECUTABLE_PATH
      : await chromium.executablePath();

    if (isLocal && !executablePath) {
      throw new Error("CHROME_EXECUTABLE_PATH is not set in local environment.");
    }

    browser = await puppeteer.launch({
      args: isLocal ? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications'] : chromium.args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath,
      headless: isLocal ? true : ((chromium as any).headless === true ? true : false),
    });

    let rawItems: ScrapedItem[] = [];

    const page = await browser.newPage();
    
    // ตั้งค่า User Agent เพื่อหลีกเลี่ยงการถูกแบนได้ดีขึ้น
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // Set Facebook Cookies to bypass login
    const c_user = process.env.FB_COOKIE_C_USER;
    const xs = process.env.FB_COOKIE_XS;

    if (c_user && xs) {
      await page.setCookie(
        { name: 'c_user', value: c_user, domain: '.facebook.com' },
        { name: 'xs', value: xs, domain: '.facebook.com' }
      );
    } else {
      console.warn("No Facebook cookies provided. Scraping might fail due to login wall.");
    }

    for (const feed of FB_PAGES) {
      try {
        await page.goto(feed.url, { waitUntil: 'networkidle2', timeout: 45000 });
        
        // Scroll slightly to trigger lazy load for posts
        await page.evaluate(() => window.scrollBy(0, 1500));
        await new Promise(r => setTimeout(r, 2000)); // wait for network

        const posts = await page.evaluate(() => {
          const articles = Array.from(document.querySelectorAll('[role="article"]'));
          if (articles.length > 0) {
            return articles.slice(0, 10).map(article => {
              // Check if it has a content image (exclude tiny icons)
              const images = Array.from(article.querySelectorAll('img'));
              const hasContentImage = images.some(img => {
                const w = parseInt(img.getAttribute('width') || '0', 10);
                const h = parseInt(img.getAttribute('height') || '0', 10);
                return (w > 100 && h > 100) || (!w && !h && img.src && !img.src.includes('emoji'));
              });

              // Extract full text to capture engagement numbers at the bottom
              const text = (article as HTMLElement).innerText;
              
              const link = article.querySelector('a[role="link"][tabindex="0"]');
              const href = link ? (link as HTMLAnchorElement).href : window.location.href;
              
              return { text: text.trim(), url: href, hasImage: hasContentImage };
            }).filter(post => post.hasImage);
          }
          return [];
        });

        for (const post of posts) {
          if (!post.text || post.text.length < 20) continue; // Skip very short/empty posts
          
          // Remove "See more" or new lines spam
          const cleanText = post.text.replace(/See more/gi, '').trim();
          
          rawItems.push({
            id: `fb-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            title: cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : ''),
            source: feed.source,
            url: post.url,
            publishedAt: new Date().toISOString(), // Fallback to current time if we can't extract timestamp
            contentSnippet: cleanText.substring(0, 1000), // Ensure we capture the engagement numbers at the end
            type: "news"
          });
        }
      } catch (err: unknown) {
        console.error(`Failed to fetch FB for ${feed.source}:`, err instanceof Error ? err.message : err);
      }
    }

    await browser.close();
    browser = null;

    // AI Filter
    const isRelevantArray = await filterAdviceRelevantNewsWithAI(rawItems);
    
    // Filter to keep only relevant news (true)
    const filteredItems = rawItems.filter((_, index) => isRelevantArray[index]);

    // Sort by newest (since we use current time, they will be ordered by scrape order)
    const topItems = filteredItems.slice(0, 40);

    const dataPath = path.join(process.cwd(), "data", "rss_news.json");
    await fs.writeFile(dataPath, JSON.stringify({ items: topItems }, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: topItems.length });
  } catch (error: unknown) {
    console.error("Trend update error:", error instanceof Error ? error.message : error);
    if (browser) await browser.close();
    return NextResponse.json({ error: "Failed to update trends" }, { status: 500 });
  }
}

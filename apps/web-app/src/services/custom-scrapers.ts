import * as cheerio from 'cheerio';

export interface ScrapedItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  contentSnippet: string;
  type: "news" | "tip";
}

export async function scrapeThaiwareNews(): Promise<ScrapedItem[]> {
  try {
    const res = await fetch('https://news.thaiware.com/', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: ScrapedItem[] = [];
    const seen = new Set<string>();

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      // Match something like /1234.html or https://.../1234.html
      if (href && href.match(/\/\d+\.html$/)) {
        const title = $(el).attr('title') || $(el).text().trim();
        if (title && title.length > 15) {
          let fullLink = href;
          if (href.startsWith('/')) {
              fullLink = 'https://news.thaiware.com' + href;
          }
          if (!seen.has(fullLink)) {
            seen.add(fullLink);
            items.push({
              id: `tw-news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              title,
              source: "Thaiware News",
              url: fullLink,
              publishedAt: new Date().toISOString(),
              contentSnippet: title, // Using title as snippet since we only scrape links
              type: "news"
            });
          }
        }
      }
    });
    return items.slice(0, 15);
  } catch (err: unknown) {
    console.error("Error scraping Thaiware News:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function scrapeThaiwareTips(): Promise<ScrapedItem[]> {
  try {
    const res = await fetch('https://tips.thaiware.com/', { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);

    const items: ScrapedItem[] = [];
    const seen = new Set<string>();

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.match(/\/\d+\.html$/)) {
        const title = $(el).attr('title') || $(el).text().trim();
        if (title && title.length > 15) {
          let fullLink = href;
          if (href.startsWith('/')) {
              fullLink = 'https://tips.thaiware.com' + href;
          }
          if (!seen.has(fullLink)) {
            seen.add(fullLink);
            items.push({
              id: `tw-tips-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              title,
              source: "Thaiware Tips",
              url: fullLink,
              publishedAt: new Date().toISOString(),
              contentSnippet: title,
              type: "tip"
            });
          }
        }
      }
    });
    return items.slice(0, 15);
  } catch (err: unknown) {
    console.error("Error scraping Thaiware Tips:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function scrapeBeartaiNews(): Promise<ScrapedItem[]> {
  try {
    const response = await fetch("https://www.beartai.com/read-category/it-news/");
    const html = await response.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    $(".bricks-layout-item.repeater-item").each((_, el) => {
      const titleEl = $(el).find("h3.dynamic a");
      const title = titleEl.text().trim();
      const url = titleEl.attr("href") || "";
      const dateText = $(el).find(".dynamic[data-field-id='1']").text().trim();
      const snippet = $(el).find(".dynamic[data-field-id='2']").text().trim();

      if (title && url) {
        let publishedAt = new Date().toISOString();
        if (dateText) {
          const parts = dateText.split("/");
          if (parts.length === 3) {
            publishedAt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).toISOString();
          }
        }
        items.push({
          id: `bt-news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title,
          source: "Beartai",
          url,
          publishedAt,
          contentSnippet: snippet,
          type: "news"
        });
      }
    });
    return items.slice(0, 10);
  } catch (err: unknown) {
    console.error("Failed to scrape Beartai:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function scrapeOverclockzoneNews(): Promise<ScrapedItem[]> {
  try {
    const response = await fetch("https://www.overclockzone.com/news/Varietytechnews/");
    const html = await response.text();
    const $ = cheerio.load(html);
    const items: ScrapedItem[] = [];

    // Parse top news
    $("#top-news .post").each((_, el) => {
      const titleEl = $(el).find("h4 a");
      const title = titleEl.text().trim();
      const url = titleEl.attr("href") || "";
      
      if (title && url) {
        items.push({
          id: `ocz-news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title,
          source: "Overclockzone",
          url: url.startsWith("http") ? url : `https://www.overclockzone.com${url}`,
          publishedAt: new Date().toISOString(),
          contentSnippet: title,
          type: "news"
        });
      }
    });

    // Parse recent news
    $("#tabot_2 .tab-post").each((_, el) => {
      const titleEl = $(el).find("a.tab-post-link span#show");
      const title = titleEl.text().trim();
      const aEl = $(el).find("a.tab-post-link");
      const url = aEl.attr("href") || "";
      const dateText = $(el).find("small").text().trim();

      if (title && url) {
        let publishedAt = new Date().toISOString();
        try {
          if (dateText) {
            publishedAt = new Date(dateText).toISOString();
          }
        } catch (e) {
          // ignore date parse errors
        }
        
        items.push({
          id: `ocz-news-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          title,
          source: "Overclockzone",
          url: url.startsWith("http") ? url : `https://www.overclockzone.com${url}`,
          publishedAt,
          contentSnippet: title,
          type: "news"
        });
      }
    });
    
    return items.slice(0, 10);
  } catch (err: unknown) {
    console.error("Failed to scrape Overclockzone:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function scrapeLineTodayTips(): Promise<ScrapedItem[]> {
  // Line Today is hard to scrape directly via HTML due to SSR/hydration obfuscation.
  // We return empty or a placeholder for now, or implement a basic fetch.
  // A real implementation might require Puppeteer or accessing their internal JSON API.
  console.log("Line Today tips scraper called (stubbed).");
  return [];
}

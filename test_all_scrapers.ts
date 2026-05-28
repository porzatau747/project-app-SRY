import Parser from "rss-parser";
import { scrapeThaiwareTips } from "./src/services/custom-scrapers";

const parser = new Parser();

const RSS_FEEDS = [
  { url: "https://www.beartai.com/read-category/it-news/feed", source: "Beartai" },
  { url: "https://droidsans.com/category/news/feed", source: "Droidsans" },
  { url: "https://www.overclockzone.com/news/Varietytechnews/feed", source: "Overclockzone" },
  { url: "https://thaitechtoday.com/feed", source: "ThaiTechToday" }
];

async function main() {
  console.log("=== Testing RSS Feeds (IT News) ===");
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching ${feed.source}...`);
      const parsed = await parser.parseURL(feed.url);
      console.log(`✅ Success: Found ${parsed.items.length} items from ${feed.source}`);
      if (parsed.items.length > 0) {
        console.log(`   Sample: ${parsed.items[0].title}`);
      }
    } catch (err: any) {
      console.log(`❌ Error fetching ${feed.source}: ${err.message}`);
    }
  }

  console.log("\n=== Testing Custom Scrapers (IT Tips) ===");
  try {
    console.log(`Fetching Thaiware Tips...`);
    const tips = await scrapeThaiwareTips();
    console.log(`✅ Success: Found ${tips.length} tips from Thaiware Tips`);
    if (tips.length > 0) {
      console.log(`   Sample: ${tips[0].title}`);
    }
  } catch (err: any) {
    console.log(`❌ Error fetching Thaiware Tips: ${err.message}`);
  }
}

main().catch(console.error);

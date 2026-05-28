import { scrapeBeartaiNews, scrapeOverclockzoneNews } from "../src/services/custom-scrapers";

async function main() {
  console.log("=== Testing Beartai Scraper ===");
  try {
    const btNews = await scrapeBeartaiNews();
    console.log(`✅ Success: Found ${btNews.length} items from Beartai`);
    if (btNews.length > 0) {
      console.log(`   Sample: ${btNews[0].title}`);
      console.log(`   Date: ${btNews[0].publishedAt}`);
      console.log(`   URL: ${btNews[0].url}`);
    }
  } catch (err: any) {
    console.log(`❌ Error fetching Beartai: ${err.message}`);
  }

  console.log("\n=== Testing Overclockzone Scraper ===");
  try {
    const oczNews = await scrapeOverclockzoneNews();
    console.log(`✅ Success: Found ${oczNews.length} items from Overclockzone`);
    if (oczNews.length > 0) {
      console.log(`   Sample: ${oczNews[0].title}`);
      console.log(`   Date: ${oczNews[0].publishedAt}`);
      console.log(`   URL: ${oczNews[0].url}`);
    }
  } catch (err: any) {
    console.log(`❌ Error fetching Overclockzone: ${err.message}`);
  }
}

main().catch(console.error);

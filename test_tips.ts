import { scrapeThaiwareTips } from "./src/services/custom-scrapers";

async function main() {
  console.log("Fetching Tips...");
  const tips = await scrapeThaiwareTips();
  console.log(`Found ${tips.length} tips.`);
  if (tips.length > 0) {
    console.log("First tip:");
    console.log(tips[0]);
  }
}

main().catch(console.error);

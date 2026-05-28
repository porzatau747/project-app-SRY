import fs from "fs/promises";
import path from "path";

const APIFY_TOKEN = "apify_api_N6UKWsGEOZRj71w5Nse3VLECU924tO2RfykD";

async function run() {
  console.log("Starting Apify actor apify/facebook-posts-scraper...");
  const res = await fetch("https://api.apify.com/v2/acts/apify~facebook-posts-scraper/runs?token=" + APIFY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [
        { url: "https://www.facebook.com/comcraft.ds" },
        { url: "https://www.facebook.com/ExtremeITReview" },
        { url: "https://www.facebook.com/notebookspec" },
        { url: "https://www.facebook.com/overclockzonefanpage" }
      ],
      resultsLimit: 24
    })
  });
  const runData = await res.json();
  const runId = runData.data.id;
  console.log("Run started:", runId);
  
  while (true) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch("https://api.apify.com/v2/actor-runs/" + runId + "?token=" + APIFY_TOKEN);
    const statusData = await statusRes.json();
    const status = statusData.data.status;
    console.log("Status:", status);
    if (status === "SUCCEEDED" || status === "FAILED") {
      if (status === "SUCCEEDED") {
        const datasetId = statusData.data.defaultDatasetId;
        const datasetRes = await fetch("https://api.apify.com/v2/datasets/" + datasetId + "/items?token=" + APIFY_TOKEN);
        const items = await datasetRes.json();
        
        const outPath = path.join(process.cwd(), "data", "apify_fb_posts.json");
        await fs.writeFile(outPath, JSON.stringify({ items }, null, 2));
        console.log("Saved", items.length, "posts to data/apify_fb_posts.json");
      } else {
        console.error("Apify run failed.");
      }
      break;
    }
  }
}

run().catch(console.error);

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import { buildInventoryFromWorkbooks } from "../../../services/inventory";
import { updatePlannerState } from "../../../services/storage";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const rootDir = path.resolve(process.cwd(), "../../"); // process.cwd() is apps/web-app usually in dev
    
    // Determine the absolute path to the data folder at the root
    let rootPath = process.cwd();
    if (rootPath.includes('apps') && rootPath.includes('web-app')) {
      rootPath = path.resolve(process.cwd(), "../../");
    }
    
    const scraperScript = path.join(rootPath, "apps", "scraping-worker", "src", "stock-scraper.ts");
    
    // 1. Run the scraper using tsx from root
    console.log("Running Playwright scraper:", scraperScript);
    await execAsync(`npx tsx "${scraperScript}"`);

    // 2. Read the generated files
    const stockPath = path.join(rootPath, "data", "stock.xlsx");
    const pricePath = path.join(rootPath, "data", "prices.xlsx");
    
    const stockBuffer = await fs.readFile(stockPath);
    const priceBuffer = await fs.readFile(pricePath);

    // 3. Build inventory
    const { inventory, summary } = buildInventoryFromWorkbooks(
      stockBuffer.buffer,
      priceBuffer.buffer,
      "Auto-Synced Stock",
      "Auto-Synced Prices"
    );

    // 4. Update state
    const state = await updatePlannerState((current) => ({
      ...current,
      inventory,
      summary,
      analysis: null,
      weeklyPlan: []
    }));

    return NextResponse.json(state);
  } catch (error: unknown) {
    console.error("Sync stock error:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

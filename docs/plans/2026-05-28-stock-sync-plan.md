# Stock Sync Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Modify the "Stock Plan" page to automatically fetch stock and standard price data directly from `branch.nescen.in.th` using a Node.js headless browser script, replacing the manual Excel upload process.

**Architecture:** We will create a standalone Node.js scraper script (`scripts/scrape_stock.ts`) using Playwright/Puppeteer that logs into the branch system, downloads the stock `.xlsx`, and scrapes the price data into another `.xlsx`. A new Next.js API route (`/api/sync-stock`) will execute this script via `child_process`, read the saved files, and update the PlannerState using the existing `buildInventoryFromWorkbooks` logic. The frontend `PlannerApp.tsx` will be updated to feature a "Sync" button instead of file upload fields.

**Tech Stack:** Node.js, Playwright (or Puppeteer), Next.js App Router, `xlsx` library.

---

### Task 1: Install Puppeteer and Setup Scraper Script

**Files:**
- Modify: `package.json` (add puppeteer)
- Create: `scripts/scrape_stock.ts`

**Step 1: Install Puppeteer**
Run: `npm install puppeteer -w apps/web-app`
*(Or install in the root if preferable)*

**Step 2: Write the Scraper Script (Failing test placeholder)**
Create `scripts/scrape_stock.ts`:
```typescript
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log("Starting scraper...");
  // Implementation will go here
}
run();
```

**Step 3: Test the Scraper Script**
Run: `npx tsx scripts/scrape_stock.ts`
Expected: Outputs "Starting scraper..."

**Step 4: Commit**
```bash
git add package.json package-lock.json apps/web-app/package.json scripts/scrape_stock.ts
git commit -m "feat: setup stock scraper script foundation"
```

### Task 2: Implement the Scraper Logic

**Files:**
- Modify: `scripts/scrape_stock.ts`

**Step 1: Add login, download, and scrape logic**
Update `scripts/scrape_stock.ts` to:
1. Launch Puppeteer browser.
2. Go to `https://branch.nescen.in.th/`, login (user: 685409, pass: Adv@02573).
3. Press `Enter` to select the branch.
4. Go to `https://branch.nescen.in.th/55000067/index.php/shop/report_store`. Click "Screen". Setup a download listener, click "Export" and save the downloaded file to `data/stock.xlsx`.
5. Go to `https://branch.nescen.in.th/55000067/index.php/shop/model_price_config`. Iterate over categories ("Accessories IT", "CCTV", "DIY", "HOME", "Mobile Accessories", "Network", "Notebook", "Printing & Image").
6. For each category, click the menu link, wait for the table, and extract `Code`, `Sell price`, `Product`, and `Itemtype`.
7. Use the `xlsx` library to create and save `data/prices.xlsx` from the scraped array.
8. `console.log("SUCCESS")` upon completion.

**Step 2: Run to verify**
Run: `npx tsx scripts/scrape_stock.ts`
Expected: "SUCCESS", and `data/stock.xlsx` and `data/prices.xlsx` are created.

**Step 3: Commit**
```bash
git add scripts/scrape_stock.ts
git commit -m "feat: implement stock and price scraping logic"
```

### Task 3: Create API Route

**Files:**
- Create: `apps/web-app/src/app/api/sync-stock/route.ts`

**Step 1: Write API logic**
Create `apps/web-app/src/app/api/sync-stock/route.ts`:
```typescript
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
    // 1. Run the scraper
    await execAsync("npx tsx scripts/scrape_stock.ts");

    // 2. Read the generated files
    const stockPath = path.resolve(process.cwd(), "../../data/stock.xlsx");
    const pricePath = path.resolve(process.cwd(), "../../data/prices.xlsx");
    
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
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Step 2: Commit**
```bash
git add apps/web-app/src/app/api/sync-stock/route.ts
git commit -m "feat: add sync-stock API route"
```

### Task 4: Update Frontend App

**Files:**
- Modify: `apps/web-app/src/app/PlannerApp.tsx`
- Modify: `apps/web-app/src/hooks/queries/useInventoryQuery.ts`

**Step 1: Update useInventoryQuery**
Add a `syncStockMutation` next to `uploadStockMutation` that sends a `POST` request to `/api/sync-stock`.

**Step 2: Update PlannerApp.tsx**
Remove the file inputs (`stockFile` and `priceFile`) and the `onSubmit` logic. Replace the form with a simple button: "ดึงข้อมูลสต็อกและราคากลางจากระบบ" that triggers `syncStockMutation.mutate()`.

**Step 3: Run to verify**
Run: `npm run dev`
Expected: UI shows the sync button. Clicking it fetches data automatically and updates the tables.

**Step 4: Commit**
```bash
git add apps/web-app/src/app/PlannerApp.tsx apps/web-app/src/hooks/queries/useInventoryQuery.ts
git commit -m "feat: update UI to use auto-sync instead of manual upload"
```

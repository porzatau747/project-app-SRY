# Trend Photo Scraping Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Add Techhub back to the list and configure the scraper to fetch exactly 5 photo-based posts per page.

**Architecture:** Modify the `apps/web-app/src/app/api/update-trends/route.ts` file to update the `FB_PAGES` constant and change the slicing logic from 4 to 5.

**Tech Stack:** Next.js API Routes, Puppeteer, TypeScript

---

### Task 1: Update API Route Data Sources and Limit

**Files:**
- Modify: `apps/web-app/src/app/api/update-trends/route.ts`

**Step 1: Write the failing test**
*(No dedicated test file exists for this scraper, we will manually verify the endpoint output.)*

**Step 2: Run test to verify it fails**
Run: `npm run build`
Expected: Passes, but behavior is wrong (pulls 3 pages, 4 posts).

**Step 3: Write minimal implementation**
Modify `route.ts` to include techhub and change limit to 5:

```typescript
const FB_PAGES = [
  { url: "https://www.facebook.com/comcraft.ds", source: "comcraft.ds" },
  { url: "https://www.facebook.com/techhub.arip", source: "techhub.arip" },
  { url: "https://www.facebook.com/notebookspec", source: "notebookspec" },
  { url: "https://www.facebook.com/overclockzonefanpage", source: "overclockzonefanpage" }
];
```

And in the grouping loop:
```typescript
    // Group by source and take up to 5 per source (to ensure trending posts per page)
    const groupedItems: Record<string, ScrapedItem[]> = {};
    for (const item of filteredItems) {
      if (!groupedItems[item.source]) groupedItems[item.source] = [];
      if (groupedItems[item.source].length < 5) { // CHANGED 4 to 5
        groupedItems[item.source].push(item);
      }
    }
```

**Step 4: Run test to verify it passes**
Run: `npm run build --prefix apps/web-app`
Expected: PASS

**Step 5: Commit**
```bash
git add apps/web-app/src/app/api/update-trends/route.ts
git commit -m "feat(trends): fetch 5 photo posts from 4 target pages including techhub"
```

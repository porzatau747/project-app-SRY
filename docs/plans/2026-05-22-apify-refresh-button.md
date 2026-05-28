# Apify Refresh Button Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Separate the Apify data fetching from the plan generation process by introducing an explicit "Refresh Data" button in the Trend Planner.

**Architecture:** We will create a new API endpoint `/api/update-trends` that connects to Apify to run the scraper and update `data/apify_fb_posts.json`. The frontend hook `useTrendPlanner` will handle the loading state, and the UI will show the new button side-by-side with the Generate button.

**Tech Stack:** Next.js API Routes, React Hooks, Node.js `fs`

---

### Task 1: Create the backend API endpoint for Apify Refresh

**Files:**
- Create: `src/app/api/update-trends/route.ts`

**Step 1: Write the API Route implementation**

```typescript
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Helper to poll Apify run status
async function waitForRun(runId: string, token: string) {
  while (true) {
    const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
    const data = await res.json();
    if (data.data.status === "SUCCEEDED") return data.data.defaultDatasetId;
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(data.data.status)) throw new Error("Apify run failed");
    await new Promise((r) => setTimeout(r, 5000));
  }
}

export async function POST(request: Request) {
  try {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("Missing APIFY_TOKEN in environment");

    // Start the run
    const startRes = await fetch(`https://api.apify.com/v2/acts/apify~facebook-pages-scraper/runs?token=${token}`, {
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
    
    if (!startRes.ok) throw new Error("Failed to start Apify actor");
    const startData = await startRes.json();
    const runId = startData.data.id;

    // Wait for dataset
    const datasetId = await waitForRun(runId, token);

    // Fetch dataset items
    const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`);
    const items = await itemsRes.json();

    // Save to disk
    const dataPath = path.join(process.cwd(), "data", "apify_fb_posts.json");
    await fs.writeFile(dataPath, JSON.stringify({ items }, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: items.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Task 2: Update `useTrendPlanner.ts` hook

**Files:**
- Modify: `src/hooks/useTrendPlanner.ts`

**Step 1: Add the `updateData` function to the hook**

Modify the hook to include `isUpdating` state and `updateData()` function.

```typescript
export function useTrendPlanner(initialPlan: TrendContentPlan) {
  const [plan, setPlan] = useState(initialPlan);
  const [action, setAction] = useState<ActionState>({ loading: false, message: "", error: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // ... existing code

  async function updateData() {
    setIsUpdating(true);
    setAction({ loading: true, message: "กำลังขูดข้อมูลจากเพจ Facebook (ใช้เวลา 1-2 นาที)...", error: "" });
    try {
      const res = await fetch("/api/update-trends", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
      setAction({ loading: false, message: `อัปเดตข้อมูลล่าสุดสำเร็จ (${data.count} โพสต์)`, error: "" });
    } catch (error) {
      setAction({ loading: false, message: "", error: error instanceof Error ? error.message : "เกิดข้อผิดพลาด" });
    } finally {
      setIsUpdating(false);
    }
  }

  return { plan, action, topPosts, generatePlan, updateData, isUpdating };
}
```

### Task 3: Update UI in `TrendPlannerApp.tsx`

**Files:**
- Modify: `src/app/trend-planner/TrendPlannerApp.tsx`

**Step 1: Add the new button to the UI**

In the "Auto Trend Radar" panel, place the new button next to the Generate button.

```tsx
<div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
  <button 
    className="secondaryButton" 
    onClick={planner.updateData} 
    disabled={planner.isUpdating || planner.action.loading}
  >
    {planner.isUpdating ? "กำลังดึงข้อมูล..." : "อัปเดตข้อมูลจากเพจ (1-2 นาที)"}
  </button>
  <button 
    className="primaryButton" 
    onClick={planner.generatePlan} 
    disabled={planner.isUpdating || planner.action.loading}
  >
    Generate แผนเทรนด์ 7 วัน
  </button>
</div>
```

# Redesign Gaming Chair Prompt Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Completely redesign the "เก้าอี้เกมมิ่ง" (Gaming Chair) template prompt in the stock AI Content Creator, aligning it with the example prompt requirements from `ตัวอย่างPrompt เจนเก้าอี้เกมมิ่ง.txt` (Thai viral memes, Thai IT trends, explicit Hook on "ทำไมถึงต้องซื้อสินค้านี้", Bridge Content [Useful, Product, Meme angle], internet spec search, using the provided product image, and 4:5 aspect ratio).

**Architecture:** Update backend template prompt definitions in `route.ts`, improve prompt guidelines in `Stock-Design.md`, and update the frontend `renderResult` in `StockContentCreator.tsx` to handle the new JSON keys (`hook`, `useful`, `product`).

**Tech Stack:** React, Next.js API Routes, TypeScript.

---

### Task 1: Update Prompt Guidelines Markdown

**Files:**
- Modify: [Stock-Design.md](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/prompts/Stock-Design.md:37-53)

**Step 1: Align guidelines with example prompt**
Rewrite Section 2 (Chair) in `Stock-Design.md` to capture:
- Thai viral memes and IT trends.
- Hook from "ทำไมถึงต้องซื้อสินค้านี้".
- Bridge Content: Useful, Product, Meme Angle.
- Use the provided product image.
- 4:5 Aspect ratio.

**Step 2: Commit**
```bash
git add apps/web-app/src/prompts/Stock-Design.md
git commit -m "docs: update Stock-Design gaming chair guidelines"
```

---

### Task 2: Redesign API Template Structure

**Files:**
- Modify: [route.ts](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/app/api/generate-content/route.ts:86-106)

**Step 1: Re-structure JSON schema and prompt details**
Modify `product-a-chair` template block to output the following JSON structure:
- `intro`: captures the updated Thai IT trend & Thai viral meme intro.
- `topic`: main gaming chair topic.
- `hook`: analyzed from "ทำไมถึงต้องซื้อสินค้านี้".
- `productName`
- `priceTag`
- `location`
- `useful`: usefulness aspect of the product.
- `product`: product spec & performance info matching the usefulness.
- `memeAngle`: Thai meme angle details.
- `visualDirection`: includes instructions to place the actual product photo in the design (4:5 ratio).
- `layout`: 4:5 layout details balancing chair image, spec text, and meme.
- `imagePrompts`: high-end DALL-E 3 image prompt (4:5 ratio).

**Step 2: Commit**
```bash
git add apps/web-app/src/app/api/generate-content/route.ts
git commit -m "feat: redesign gaming chair prompt structure in API route"
```

---

### Task 3: Update Frontend Result Parser and Display

**Files:**
- Modify: [StockContentCreator.tsx](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/components/planner/StockContentCreator.tsx:31-48)

**Step 1: Add new key parsing in `renderResult`**
Extend `promptText` rendering in `StockContentCreator.tsx` to check and output `hook`, `useful`, and `product` if they exist in the JSON response.

**Step 2: Verify Compiles**
Run `npx tsc --noEmit` in `apps/web-app`.

**Step 3: Commit**
```bash
git add apps/web-app/src/components/planner/StockContentCreator.tsx
git commit -m "feat: support hook, useful, and product keys in stock content renderer"
```

---

### Verification Plan

#### Manual Verification
1. Run `npm run dev` to start the app.
2. Select a gaming chair from the stock list table.
3. Click "✨ สร้างคอนเทนต์" to pull details.
4. Select "เก้าอี้เกมมิ่ง" in "รูปแบบคอนเทนต์" select.
5. Click "ร่าง Prompt ด้วย Gemini".
6. Verify that the resulting preview shows:
   - "Hook: ..."
   - "Useful: ..."
   - "Product (ข้อมูลเชื่อมโยง): ..."
   - "Meme Angle: ..."
   - "รายละเอียดภาพ (Image Prompts)" with 4:5 ratio constraints and composition details including the real product photo instruction.

# Video Thumbnail Custom Inputs Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Add custom input fields for "หัวข้อของคอนเทนต์คลิป" (Video Topic) and "บรีฟที่อยากได้ในภาพ" (Image Brief) when selecting the "ภาพปกคลิป" (Video Thumbnail) template in the AI Content Creator.

**Architecture:** Extend the Zustand UI store to maintain state for the two new input fields. Conditionally show these fields in the `StockContentCreator.tsx` frontend component instead of the general product prompt text area. Send these values to the backend API via the mutation payload, and update the API route to use these fields to format a more targeted system prompt for Gemini.

**Tech Stack:** React, TypeScript, Next.js API Routes, Zustand, Tailwind CSS/Vanilla CSS.

---

### Task 1: Extend Zustand UI Store State

**Files:**
- Modify: [uiStore.ts](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/store/uiStore.ts)

**Step 1: Add new fields and actions to `UIState` interface and initial state**
Extend `UIState` with `aiVideoTopic` and `aiVideoBrief` and their setter functions:
```typescript
interface UIState {
  // ... existing fields ...
  aiVideoTopic: string;
  setAIVideoTopic: (topic: string) => void;
  aiVideoBrief: string;
  setAIVideoBrief: (brief: string) => void;
}
```
Implement the defaults and setters in `useUIStore`.

**Step 2: Verify code compiling**
Run a TypeScript build or type check to ensure `uiStore` remains correct.
Run: `npm run build` or similar in `apps/web-app` directory.

**Step 3: Commit**
```bash
git add apps/web-app/src/store/uiStore.ts
git commit -m "feat: add video thumbnail fields to UI store"
```

---

### Task 2: Update React Query Mutation Payload

**Files:**
- Modify: [useAIMutation.ts](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/hooks/queries/useAIMutation.ts)

**Step 1: Extend `GenerateContentPayload`**
Add optional fields `videoTopic` and `videoBrief`:
```typescript
type GenerateContentPayload = {
  template: string;
  prompt: string;
  freeGift: string;
  videoTopic?: string;
  videoBrief?: string;
};
```

**Step 2: Verify types compile**
Check imports in other files.

**Step 3: Commit**
```bash
git add apps/web-app/src/hooks/queries/useAIMutation.ts
git commit -m "feat: update AI generation payload type definition"
```

---

### Task 3: Update StockContentCreator Frontend Form

**Files:**
- Modify: [StockContentCreator.tsx](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/components/planner/StockContentCreator.tsx)

**Step 1: Extract new state values and wire them into form conditional inputs**
- Extract `aiVideoTopic`, `setAIVideoTopic`, `aiVideoBrief`, `setAIVideoBrief` from `useUIStore`.
- Conditionally render inputs when `template === "video-thumbnail"`. Show two input fields:
  - "หัวข้อของคอนเทนต์คลิป (ต้องการ)" - text input
  - "บรีฟที่อยากได้ในภาพ" - textarea
- Hide the default "ข้อมูลสินค้า" textarea and "ของแถม" inputs when `template === "video-thumbnail"`.
- Update the submit button's `disabled` prop to require `aiVideoTopic` if template is `video-thumbnail`.
- Update `handleGenerateContent` to send `videoTopic` and `videoBrief` to the mutation.

**Step 2: Verify layout matches application style**
Ensure the layout, input classes (`trendBox`), and styling matches existing input fields.

**Step 3: Commit**
```bash
git add apps/web-app/src/components/planner/StockContentCreator.tsx
git commit -m "feat: render specific inputs for video-thumbnail template"
```

---

### Task 4: Update Backend API Handler for Prompt Generation

**Files:**
- Modify: [route.ts](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/app/api/generate-content/route.ts)

**Step 1: Parse new fields and format the template prompt**
- Retrieve `videoTopic` and `videoBrief` from the JSON payload in `POST`.
- Under `template === "video-thumbnail"`, construct a structured description format:
  ```typescript
  let thumbnailContext = "";
  if (videoTopic) {
    thumbnailContext += `หัวข้อของคอนเทนต์คลิป: ${videoTopic}\n`;
  }
  if (videoBrief) {
    thumbnailContext += `บรีฟภาพ/องค์ประกอบที่ต้องการ: ${videoBrief}\n`;
  }
  if (!thumbnailContext) {
    thumbnailContext = prompt;
  }
  ```
- Inject `thumbnailContext` into the prompt rather than `prompt`.

**Step 2: Verify API compiles**
Run TypeScript check or build command.

**Step 3: Commit**
```bash
git add apps/web-app/src/app/api/generate-content/route.ts
git commit -m "feat: handle video topic and brief in prompt generation API"
```

---

### Verification Plan

#### Manual Verification
1. Run `npm run dev` to start the application.
2. Select "ภาพปกคลิป (Video Thumbnail)" from the "รูปแบบคอนเทนต์" dropdown.
3. Verify that the "ข้อมูลสินค้า" textarea is hidden and two fields ("หัวข้อของคอนเทนต์คลิป" and "บรีฟที่อยากได้ในภาพ") are displayed instead.
4. Verify that the "ร่าง Prompt ด้วย Gemini" button is disabled if "หัวข้อของคอนเทนต์คลิป" is empty.
5. Enter a topic (e.g. "แนะนำ 5 ฟีเจอร์ลับ Windows 11 ที่คนส่วนใหญ่ไม่รู้") and a brief (e.g. "มีรูปหน้าต่าง Windows โลโก้เรืองแสงสีฟ้า พรีเซนเตอร์ผู้หญิงยืนทำหน้าตื่นเต้น").
6. Click "ร่าง Prompt ด้วย Gemini" and verify that the resulting JSON structure has correct DALL-E prompt details including the custom topic and visual brief details.

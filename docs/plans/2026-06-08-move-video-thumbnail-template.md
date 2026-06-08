# Move Video Thumbnail Template Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Move the "ภาพปกคลิป" (Video Thumbnail) template option from the "แผนจากสต็อก" page (in `StockContentCreator.tsx`) to the "สร้างคอนเทนต์ด้วย AI" page (in `ContentCreatorApp.tsx`), including its custom inputs "หัวข้อของคอนเทนต์คลิป" and "บรีฟที่อยากได้ในภาพ".

**Architecture:** Remove `video-thumbnail` template logic, Badges, and input overrides from `StockContentCreator.tsx`. Add them to `ContentCreatorApp.tsx` by using local React states for the inputs, rendering conditional fields, formatting the mutation payload, and handling the JSON result display parsing for `video-thumbnail`.

**Tech Stack:** React, Next.js, Zustand, TypeScript.

---

### Task 1: Update StockContentCreator Component (Remove Video Thumbnail option)

**Files:**
- Modify: [StockContentCreator.tsx](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/components/planner/StockContentCreator.tsx)

**Step 1: Remove `video-thumbnail` references**
- Remove template option `<option value="video-thumbnail">ภาพปกคลิป (Video Thumbnail)</option>` from dropdown.
- Remove badge label check for `video-thumbnail`.
- Remove the conditional rendering logic for `template === "video-thumbnail"` in the inputs section.
- Simplify state extraction in `StockContentCreator` (optionally keep Zustand fields `aiVideoTopic` and `aiVideoBrief` or keep them as deprecated since they are now handled locally in `ContentCreatorApp`). Let's keep the UI store clean but only modify the component itself to avoid unnecessary store updates if not required. Wait, we should clean up the component's state hooks and `handleGenerateContent` payload.

**Step 2: Commit**
```bash
git add apps/web-app/src/components/planner/StockContentCreator.tsx
git commit -m "refactor: remove video-thumbnail template from StockContentCreator"
```

---

### Task 2: Update ContentCreatorApp Component (Add Video Thumbnail option and Inputs)

**Files:**
- Modify: [ContentCreatorApp.tsx](file:///d:/por/project%20app/weekly-content-planner/apps/web-app/src/app/content-creator/ContentCreatorApp.tsx)

**Step 1: Add new local states and render inputs**
- Add `videoTopic` and `videoBrief` state hooks.
- Add `<option value="video-thumbnail">ภาพปกคลิป (Video Thumbnail)</option>` to the template select.
- Add conditional rendering for `template === "video-thumbnail"` inputs (same design as the inputs we had in StockContentCreator):
  - "หัวข้อของคอนเทนต์คลิป (ต้องการ)" - text input
  - "บรีฟที่อยากได้ในภาพ" - textarea
- Hide the default "หัวข้อ / สินค้า" field when `template === "video-thumbnail"`.
- Update `handleGenerate` fetch request to include `videoTopic` and `videoBrief`.
- Update the submit button disabled check: `disabled={loading || (template === "video-thumbnail" ? !videoTopic : !prompt)}`.
- Update `renderResult` to handle `template === "video-thumbnail"` JSON response format and render the appropriate layout and full prompt text.

**Step 2: Verify Compiles**
Run `npx tsc --noEmit` in `apps/web-app`.

**Step 3: Commit**
```bash
git add apps/web-app/src/app/content-creator/ContentCreatorApp.tsx
git commit -m "feat: add video-thumbnail template with custom inputs to ContentCreatorApp"
```

---

### Verification Plan

#### Manual Verification
1. Run `npm run dev` to start the application.
2. Go to the **แผนจากสต็อก** page, check that "ภาพปกคลิป" is no longer available in the "รูปแบบคอนเทนต์" select.
3. Go to the **สร้างคอนเทนต์ด้วย AI** page.
4. Select "ภาพปกคลิป (Video Thumbnail)" from the dropdown.
5. Verify that the two input fields ("หัวข้อของคอนเทนต์คลิป" and "บรีฟที่อยากได้ในภาพ") appear.
6. Verify that "หัวข้อของคอนเทนต์คลิป" is required (button disabled if empty).
7. Input a test topic and brief, click "ร่างคอนเทนต์ด้วย Gemini".
8. Verify that the result displays properly and the copied prompt matches the video thumbnail layout.

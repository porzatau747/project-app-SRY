# AI Content Creator Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** สร้างแท็บ "AI Content Creator" เพื่อช่วยร่างคอนเทนต์ไอทีแบบอัตโนมัติ โดยใช้ Gemini API เป็นเครื่องมือหลังบ้าน

**Architecture:** โครงสร้างจะคล้ายกับ Trend Planner โดยมีหน้า Route แยกต่างหาก (`src/app/content-creator/page.tsx`) และมี API Route (`src/app/api/generate-content/route.ts`) สำหรับรับ Prompt จากหน้าจอไปประมวลผลกับ Gemini API

**Tech Stack:** Next.js App Router, React, Gemini SDK (via OpenAI compat layer or native fetch), CSS Modules/Globals

---

### Task 1: Navigation & Layout Setup

**Files:**
- Modify: `src/app/layout.tsx:1-100` (เพิ่มลิงก์ที่ Sidebar/Navbar)
- Modify: `src/app/trend-planner/TrendPlannerApp.tsx:20-28` (อัปเดต TopNav ให้เห็นครบ 3 เมนู)
- Create: `src/app/content-creator/page.tsx`

**Step 1: Write the failing test**

```tsx
// ทดสอบ Manual Navigation
// รันเซิร์ฟเวอร์ด้วย npm run dev แล้วเปิดไปที่ /content-creator จะต้องเจอหน้า 404
```

**Step 2: Run test to verify it fails**

Run: `curl http://localhost:3000/content-creator`
Expected: 404 Not Found

**Step 3: Write minimal implementation**

```tsx
// src/app/content-creator/page.tsx
export default function ContentCreatorPage() {
  return (
    <main className="appShell">
      <div className="appPage">
        <h1>AI Content Creator</h1>
      </div>
    </main>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/content-creator/page.tsx
git commit -m "feat: setup content creator route"
```

---

### Task 2: Backend API for Gemini Content Generation

**Files:**
- Create: `src/app/api/generate-content/route.ts`

**Step 1: Write the failing test**

```ts
// scratch/test_generate_content.ts
const res = await fetch("http://localhost:3000/api/generate-content", {
  method: "POST",
  body: JSON.stringify({ template: "tips", input: "Mouse" })
});
```

**Step 2: Run test to verify it fails**

Run: `npx tsx scratch/test_generate_content.ts`
Expected: FAIL with 404

**Step 3: Write minimal implementation**

```ts
// src/app/api/generate-content/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { template, prompt } = await req.json();
    const openai = new OpenAI({ 
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });

    let systemPrompt = `คุณคือผู้เชี่ยวชาญด้านการสร้างคอนเทนต์ไอทีและการตลาดสำหรับร้าน Advice IT 
เขียนคอนเทนต์ภาษาไทยแบบเป็นกันเอง อ่านง่าย น่าสนใจ และเป็นประโยชน์`;

    if (template === "free-text") {
      systemPrompt += `\nคำสั่งจากผู้ใช้งาน: ${prompt}`;
    } else {
      systemPrompt += `\nประเภทคอนเทนต์: ${template}\nหัวข้อ/สินค้า: ${prompt}\nความยาวไม่เกิน 150 คำ`;
    }

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: systemPrompt }],
      temperature: 0.7,
    });
    
    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/generate-content/route.ts
git commit -m "feat: add gemini generation API"
```

---

### Task 3: Content Creator Frontend App

**Files:**
- Create: `src/app/content-creator/ContentCreatorApp.tsx`
- Modify: `src/app/content-creator/page.tsx`

**Step 1: Write the failing test**

```tsx
// ตรวจสอบว่าหน้าจอ /content-creator มีช่องกรอกข้อมูลและปุ่ม Generate หรือไม่
```

**Step 2: Run test to verify it fails**

Run: เช็กด้วยตาเปล่าที่ /content-creator
Expected: เห็นแค่คำว่า "AI Content Creator" ไม่มีฟอร์ม

**Step 3: Write minimal implementation**

```tsx
// src/app/content-creator/ContentCreatorApp.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContentCreatorApp() {
  const [template, setTemplate] = useState("ทิปส์ไอที");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify({ template, prompt })
      });
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      setResult("Error generating content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appPage">
      <nav className="topNav">
        <Link href="/">แผนจากสต็อก</Link>
        <Link href="/trend-planner">แผนจากเทรนด์</Link>
        <Link className="activeNav" href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
      </nav>
      <header className="appHero">
        <div>
          <h1>AI Content Creator</h1>
          <p className="intro">สร้างคอนเทนต์ด้วย AI ผ่าน Template แบบรวดเร็ว หรือพิมพ์สั่งอย่างอิสระ</p>
        </div>
      </header>
      <section className="gridTwo">
        <div className="panel stepPanel">
          <div className="fileInput">
            <label>รูปแบบคอนเทนต์</label>
            <select value={template} onChange={e => setTemplate(e.target.value)} className="trendBox">
              <option value="ทิปส์ไอที">ทิปส์ไอที / แก้ปัญหาคอม</option>
              <option value="เลือกซื้อสินค้า">คำแนะนำก่อนซื้อ (Buying Guide)</option>
              <option value="โปรโมชัน">โพสต์ขาย/โปรโมชัน</option>
              <option value="free-text">พิมพ์คำสั่งเอง (Free-text)</option>
            </select>
          </div>
          <div className="fileInput">
            <label>{template === "free-text" ? "คำสั่งสำหรับ AI (Prompt)" : "หัวข้อ / สินค้า (เช่น 'วิธีเลือกเมาส์เกมมิ่ง' หรือ 'Notebook Acer')"}</label>
            {template === "free-text" ? (
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                className="trendBox"
                placeholder='เช่น "ช่วยเขียนโพสต์แนะนำวิธีเลือกซื้อการ์ดจอสำหรับงบ 10,000 บาทหน่อย"'
                rows={5}
              />
            ) : (
              <input value={prompt} onChange={e => setPrompt(e.target.value)} />
            )}
          </div>
          <button className="primaryButton" onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? "กำลังร่างคอนเทนต์..." : "ร่างคอนเทนต์ด้วย Gemini"}
          </button>
        </div>
        <div className="panel stepPanel">
          <div className="sectionHeader"><h2>ผลลัพธ์จาก AI</h2></div>
          {result && (
            <div className="assetBox">
              <p style={{ whiteSpace: "pre-wrap" }}>{result}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

**Step 4: Run test to verify it passes**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/content-creator/ContentCreatorApp.tsx src/app/content-creator/page.tsx
git commit -m "feat: complete frontend for content creator"
```

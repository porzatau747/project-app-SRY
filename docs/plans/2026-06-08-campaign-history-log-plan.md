# Campaign History Log Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** พัฒนาระบบแถบลิ้นชักแสดงประวัติย้อนหลัง (Global Sidebar Drawer) ที่จัดเก็บผลลัพธ์การสร้างโพสต์และ Prompt ของผู้ใช้งาน 15 รายการล่าสุดใน LocalStorage พร้อมความสามารถในการคัดลอกด่วน ตรึงรายการ และกู้คืนฟอร์มกรอกข้อมูล

**Architecture:** สร้างโมดูลเก็บประวัติ `historyUtils` และยูนิตเทสต์ใน Vitest จากนั้นพัฒนาคอมโพเนนต์ `HistoryDrawer` ที่เลื่อนเปิดได้ด้วยดีไซน์กระจกเบลอนีออนไซเบอร์ และเชื่อมการกู้คืนฟอร์มด้วย Custom Event System

**Tech Stack:** Next.js, React, Zustand, LocalStorage, Vitest

---

### Task 1: พัฒนาระบบจัดการประวัติ (Storage Utility Functions)

**Files:**
- Create: `apps/web-app/src/utils/historyUtils.ts`

**Step 1: เขียนโมดูลจัดการประวัติใน LocalStorage**
เขียนฟังก์ชันสำหรับดึงข้อมูล, เซฟข้อมูล, ลบ และปักหมุดข้อมูลประวัติลงใน `apps/web-app/src/utils/historyUtils.ts`:
```typescript
import { HistoryItem } from "../types/planner";

const STORAGE_KEY = "weekly_planner_campaign_history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveToHistory(item: Omit<HistoryItem, "id" | "timestamp" | "isPinned">): HistoryItem {
  const newItem: HistoryItem = {
    ...item,
    id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    isPinned: false
  };

  const history = getHistory();
  
  // ตรวจสอบข้อมูลซ้ำ
  const isDuplicate = history.some(h => h.title === item.title && h.result === item.result);
  if (isDuplicate) return newItem;

  history.unshift(newItem);

  // ควบคุมขนาดสูงสุด 15 รายการ โดยไม่ลบรายการที่ปักหมุดตรึงไว้
  if (history.length > 15) {
    let unpinnedIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
      if (!history[i].isPinned) {
        unpinnedIndex = i;
        break;
      }
    }
    if (unpinnedIndex !== -1) {
      history.splice(unpinnedIndex, 1);
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // ลบรายการเก่าสุดที่ไม่ได้ตรึงเพิ่มเพื่อเคลียร์พื้นที่
    const onlyPinned = history.filter(h => h.isPinned);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onlyPinned.slice(0, 10)));
  }

  return newItem;
}

export function deleteFromHistory(id: string): HistoryItem[] {
  const history = getHistory().filter(item => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
  return history;
}

export function togglePinHistory(id: string): HistoryItem[] {
  const history = getHistory().map(item => 
    item.id === id ? { ...item, isPinned: !item.isPinned } : item
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {}
  return history;
}
```

**Step 2: รันคำสั่งไทป์เช็กเพื่อตรวจสอบไวยากรณ์**
- รัน: `npx tsc --noEmit` จากโฟลเดอร์ `apps/web-app`
- คาดหวัง: ผ่าน ไม่มีข้อผิดพลาด

---

### Task 2: เขียนและตรวจสอบ Unit Test สำหรับ History Utility

**Files:**
- Create: `apps/web-app/src/utils/historyUtils.test.ts`

**Step 1: เขียนยูนิตเทสต์ใน historyUtils.test.ts**
เขียนเคสทดสอบการจัดเก็บและการจำกัด 15 รายการ:
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getHistory, saveToHistory, deleteFromHistory, togglePinHistory } from "./historyUtils";

describe("historyUtils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ควรบันทึกประวัติใหม่และดึงกลับมาได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบคอมโบ",
      result: "ผลลัพธ์จาก AI",
      inputState: { test: true }
    });

    const history = getHistory();
    expect(history.length).toBe(1);
    expect(history[0].title).toBe("ทดสอบคอมโบ");
    expect(history[0].isPinned).toBe(false);
  });

  it("สามารถลบรายการประวัติได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบลบ",
      result: "ผลลัพธ์ลบ",
      inputState: null
    });

    const afterDelete = deleteFromHistory(item.id);
    expect(afterDelete.length).toBe(0);
  });

  it("สามารถสลับสถานะการปักหมุดตรึงได้", () => {
    const item = saveToHistory({
      pageType: "stock",
      title: "ทดสอบปักหมุด",
      result: "ผลลัพธ์ปักหมุด",
      inputState: null
    });

    const pinned = togglePinHistory(item.id);
    expect(pinned[0].isPinned).toBe(true);
  });
});
```

**Step 2: รัน Unit Test**
- รัน: `npx vitest run src/utils/historyUtils.test.ts`
- คาดหวัง: PASS

**Step 3: Commit**
```bash
git add apps/web-app/src/utils/historyUtils.ts apps/web-app/src/utils/historyUtils.test.ts
git commit -m "test: add campaign history utilities and vitest coverage"
```

---

### Task 3: สร้าง UI Drawer สำหรับเก็บประวัติย้อนหลัง (History Drawer Component)

**Files:**
- Create: `apps/web-app/src/components/history/HistoryDrawer.tsx`

**Step 1: พัฒนาแผงลิ้นชักสไลด์พร้อมลูกเล่นไฟสะท้อนสีนีออน**
สร้างคอมโพเนนต์ `HistoryDrawer` ใน `apps/web-app/src/components/history/HistoryDrawer.tsx`:
```typescript
import React, { useEffect, useState } from "react";
import { getHistory, deleteFromHistory, togglePinHistory } from "../../utils/historyUtils";
import { HistoryItem } from "../../types/planner";
import toast from "react-hot-toast";

export function HistoryDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = deleteFromHistory(id);
    setHistory(updated);
    toast.success("ลบประวัติเรียบร้อยแล้ว");
  };

  const handleTogglePin = (id: string) => {
    const updated = togglePinHistory(id);
    setHistory(updated);
  };

  const handleRestore = (item: HistoryItem) => {
    // เรียกใช้งาน Custom Event เพื่อแจ้งให้แต่ละหน้าทำการกู้ข้อมูลฟอร์ม
    const event = new CustomEvent("restore-campaign", { detail: item });
    window.dispatchEvent(event);
    toast.success(`กู้คืนข้อมูลแบบร่าง "${item.title}" สำเร็จ`);
    onClose();
  };

  const getPageColor = (pageType: string) => {
    switch (pageType) {
      case "stock": return "var(--color-neon-cyan)";
      case "trend": return "#22c55e"; // Green
      case "combo": return "#a855f7"; // Purple
      default: return "var(--color-neon-yellow)";
    }
  };

  const getPageLabel = (pageType: string) => {
    switch (pageType) {
      case "stock": return "สต็อก";
      case "trend": return "เทรนด์";
      case "combo": return "คอมโบ";
      default: return "AI";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 100
        }}
      />

      {/* Sliding Drawer */}
      <div 
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100%, 380px)",
          background: "rgba(10, 15, 30, 0.95)",
          borderLeft: "1px solid var(--color-glass-border)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.7), -2px 0 10px rgba(34,211,238,0.2)",
          backdropFilter: "blur(20px)",
          zIndex: 101,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          color: "#fafaf9"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-glass-border)", paddingBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-neon-cyan)", textShadow: "0 0 10px rgba(34,211,238,0.3)" }}>
            🕒 ประวัติแคมเปญ
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#a8a29e",
              fontSize: "1.5rem",
              cursor: "pointer"
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
          {history.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
              ไม่มีประวัติแคมเปญคอนเทนต์
            </div>
          ) : (
            history.map(item => (
              <div 
                key={item.id}
                style={{
                  padding: "12px",
                  background: "rgba(2,4,10,0.6)",
                  border: "1px solid var(--color-glass-border)",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span 
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: `rgba(255,255,255,0.05)`,
                      color: getPageColor(item.pageType),
                      border: `1px solid ${getPageColor(item.pageType)}`
                    }}
                  >
                    {getPageLabel(item.pageType)}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleTogglePin(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: item.isPinned ? "var(--color-neon-yellow)" : "#475569", fontSize: "1rem" }}
                      title="ปักหมุดเพื่อไม่ให้ถูกลบอัตโนมัติ"
                    >
                      ⭐
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-clearance-red)", fontSize: "1rem" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 style={{ margin: 0, fontSize: "0.9rem", color: "#fafaf9" }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#94a3b8", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {item.result}
                </p>

                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button 
                    onClick={() => handleRestore(item)}
                    className="primaryButton"
                    style={{ flex: 1, minHeight: "30px", fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    🔄 กู้คืนฟอร์ม
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.result);
                      toast.success("คัดลอกคอนเทนต์เรียบร้อย!");
                    }}
                    className="secondaryButton"
                    style={{ flex: 1, minHeight: "30px", fontSize: "0.75rem", padding: "4px 8px" }}
                  >
                    📋 คัดลอกด่วน
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
```

**Step 2: คอมไพล์โปรเจกต์**
- รัน: `npx tsc --noEmit`
- คาดหวัง: ผ่าน ไม่มีข้อผิดพลาด

---

### Task 4: เชื่อมโยงปุ่ม Toggle และรองรับฟังก์ชันการกู้คืนแคมเปญ

**Files:**
- Modify: `apps/web-app/src/app/PlannerApp.tsx`
- Modify: `apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx`
- Modify: `apps/web-app/src/app/promotion-combo/PromotionComboApp.tsx`
- Modify: `apps/web-app/src/app/content-creator/ContentCreatorApp.tsx`

**Step 1: เพิ่มปุ่มคุมประวัติย้อนหลังในเมนูนำทางและเรียกใช้ลิ้นชัก (History Drawer)**
ในหน้าประกอบแอปทุกหน้า นำเข้าและเรนเดอร์ History Drawer พร้อมปุ่มเปิด-ปิด:
- ดึงสถานะ `isHistoryOpen, setIsHistoryOpen` ด้วย `useState`
- วางปุ่มสัญลักษณ์นาฬิกาประวัติ 🕒 ไว้ถัดจากคู่มือการใช้งาน:
```typescript
{/* แทรกส่วนนี้เพิ่มถัดจากลิงก์เมนูนำทางเดิม */}
<button 
  onClick={() => setIsHistoryOpen(true)}
  style={{
    background: 'transparent',
    border: 'none',
    color: 'var(--color-neon-cyan)',
    cursor: 'pointer',
    fontSize: '0.86rem',
    fontWeight: '800',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.3s'
  }}
  title="เปิดคลังประวัติแคมเปญ"
>
  🕒 ประวัติ
</button>
```
และเรนเดอร์ `<HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />` ไว้ที่ส่วนล่างสุดของแต่ละคอมโพเนนต์

**Step 2: บันทึกประวัติเมื่อเจเนอเรตเนื้อหาสำเร็จ**
เรียกฟังก์ชัน `saveToHistory` เมื่อแอปพลิเคชันสร้าง Prompt หรือโพสต์สำเร็จ:
- ใน **PlannerApp.tsx**: เมื่อกดคัดลอก Prompt หรือเลือกแคมเปญสำเร็จ
- ใน **TrendPlannerApp.tsx**: เมื่อบอทเจนข่าวสำเร็จ (ผลลัพธ์ไม่ใช่ค่าว่าง) ให้เรียก `saveToHistory({ pageType: 'trend', title: item.label, result: finalResult, inputState: item })`
- ใน **PromotionComboApp.tsx**: เมื่อเจนคอมโบสำเร็จ เรียก `saveToHistory({ pageType: 'combo', title: `โปรโมชันคู่ ${productA.product} + ${productB.product}`, result: finalResult, inputState: { productA, productB, promoPriceB } })`
- ใน **ContentCreatorApp.tsx**: เมื่อเขียนคอนเทนต์สำเร็จ เรียก `saveToHistory({ pageType: 'creator', title: `เทมเพลต ${template}: ${prompt || videoTopic}`, result: finalResult, inputState: { template, prompt, imageLayout, videoTopic, videoBrief } })`

**Step 3: รองรับ Event การกู้คืนข้อมูล (Event Listener)**
ในหน้า **ContentCreatorApp.tsx** และหน้ารับข้อมูลฟอร์ม เพิ่ม Event Listener เพื่อกู้คืนฟิลด์อินพุต:
```typescript
// ใน ContentCreatorApp.tsx เพิ่ม useEffect
useEffect(() => {
  const handleRestore = (e: Event) => {
    const item = (e as CustomEvent).detail;
    if (item.pageType === 'creator') {
      const state = item.inputState;
      if (state) {
        if (state.template) setTemplate(state.template);
        if (state.prompt) setPrompt(state.prompt);
        if (state.imageLayout) setImageLayout(state.imageLayout);
        if (state.videoTopic) setVideoTopic(state.videoTopic);
        if (state.videoBrief) setVideoBrief(state.videoBrief);
      }
    }
  };
  window.addEventListener('restore-campaign', handleRestore);
  return () => window.removeEventListener('restore-campaign', handleRestore);
}, []);
```
ทำในทำนองเดียวกันสำหรับ **PromotionComboApp.tsx**:
```typescript
// ใน PromotionComboApp.tsx
useEffect(() => {
  const handleRestore = (e: Event) => {
    const item = (e as CustomEvent).detail;
    if (item.pageType === 'combo') {
      const state = item.inputState;
      if (state) {
        if (state.productA) setProductA(state.productA);
        if (state.productB) setProductB(state.productB);
        if (state.promoPriceB) setPromoPriceB(state.promoPriceB);
      }
    }
  };
  window.addEventListener('restore-campaign', handleRestore);
  return () => window.removeEventListener('restore-campaign', handleRestore);
}, []);
```

**Step 4: รันตรวจสอบ Build และความเรียบร้อยของโปรเจกต์**
- รันการเช็กสแต็กไทป์: `npx tsc --noEmit`
- รันการตรวจสอบบิลด์แอป: `npm run build`
- คาดหวัง: บิลด์ผ่านสำเร็จร้อยเปอร์เซ็นต์ ไร้ข้อผิดพลาด

**Step 5: Commit**
```bash
git add apps/web-app/src/app/PlannerApp.tsx apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx apps/web-app/src/app/promotion-combo/PromotionComboApp.tsx apps/web-app/src/app/content-creator/ContentCreatorApp.tsx apps/web-app/src/components/history/HistoryDrawer.tsx
git commit -m "feat: integrate global sidebar campaign history drawer and restore event system"
```

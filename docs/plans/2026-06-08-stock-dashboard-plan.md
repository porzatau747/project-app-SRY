# แดชบอร์ดสรุปสต็อกและจัดกลุ่มหมวดหมู่แบบไดนามิก (Stock Dashboard & Dynamic Grouping) Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** เพิ่มคอมโพเนนต์แดชบอร์ดแสดงสถานะทางการเงิน อายุสินค้า และแถบสัดส่วนประเภทสินค้าแบบไดนามิก (สูงสุด 6 เซกเมนต์) ในหน้า "แผนจากสต็อก" โดยแยกกลุ่มเมาส์และคีย์บอร์ดทั่วไปออกจากหมวดหมู่อื่นๆ

**Architecture:** แยกหมวดหมู่สินค้าใน `categoryUtils.ts` ให้คืนค่ากลุ่มใหม่ชื่อ `"เมาส์และคีย์บอร์ด (ทั่วไป)"` สำหรับคีย์บอร์ดและเมาส์ธรรมดา จากนั้นสร้างคอมโพเนนต์ `StockDashboard.tsx` เพื่อคำนวณและแสดงผลตัวชี้วัด สัดส่วน และเอฟเฟกต์การชี้เมาส์ (Hover Highlight) แบบรวมศูนย์

**Tech Stack:** Next.js, React, Vitest, Tailwind CSS (หรือ Inline Styles สอดคล้องกับ OLED Dark Theme)

---

### Task 1: อัปเดตโครงสร้างหมวดหมู่ใน categoryUtils

**Files:**
- Modify: `apps/web-app/src/utils/categoryUtils.ts`
- Create: `apps/web-app/src/utils/categoryUtils.test.ts`

**Step 1: เขียน Unit Test สำหรับ categoryUtils**
สร้างไฟล์ `apps/web-app/src/utils/categoryUtils.test.ts` เพื่อทดสอบการแบ่งหมวดหมู่ของสินค้า:
```typescript
import { describe, it, expect } from "vitest";
import { getMacroCategory } from "./categoryUtils";

describe("getMacroCategory", () => {
  it("ควรแยกแยะเมาส์และคีย์บอร์ดธรรมดาเป็นหมวดหมู่ เมาส์และคีย์บอร์ด (ทั่วไป)", () => {
    expect(getMacroCategory("KEYBOARD")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
    expect(getMacroCategory("MOUSE")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
    expect(getMacroCategory("COMBO-WL SIGNO KW-760+WM106")).toBe("เมาส์และคีย์บอร์ด (ทั่วไป)");
  });

  it("เมาส์และคีย์บอร์ดสำหรับเกมมิ่งควรเข้ากลุ่ม Gaming & Stream", () => {
    expect(getMacroCategory("Gaming Keyboard")).toBe("Gaming & Stream");
    expect(getMacroCategory("Gaming Mouse")).toBe("Gaming & Stream");
  });

  it("สินค้าหูฟังและอุปกรณ์เสริมอื่นๆ ควรยังอยู่ใน Accessories", () => {
    expect(getMacroCategory("headphone")).toBe("Accessories");
    expect(getMacroCategory("usb")).toBe("Accessories");
  });
});
```

**Step 2: รันการทดสอบเพื่อให้มั่นใจว่าทดสอบล้มเหลว (Fail)**
- รันคำสั่ง: `npx vitest run src/utils/categoryUtils.test.ts` จากโฟลเดอร์ `apps/web-app`
- คาดหวัง: ผลทดสอบล้มเหลว (เนื่องจากยังไม่มีกลุ่มใหม่)

**Step 3: ปรับปรุงเงื่อนไขใน categoryUtils.ts**
ปรับแต่งไฟล์ `apps/web-app/src/utils/categoryUtils.ts` เพื่อเพิ่มหมวดหมู่ `"เมาส์และคีย์บอร์ด (ทั่วไป)"` และตรวจจับเงื่อนไขเมาส์/คีย์บอร์ดธรรมดาก่อนเข้า `Accessories`:
```typescript
// ในส่วนของ MacroCategory type
export type MacroCategory =
  | "Notebook & PC"
  | "BUNDLE COMSET"
  | "BUNDLE Notebook"
  | "Component"
  | "Monitor & Display"
  | "Gaming & Stream"
  | "Network & CCTV"
  | "Printer"
  | "Ink"
  | "Accessories"
  | "Clearance"
  | "Services & Others"
  | "เมาส์และคีย์บอร์ด (ทั่วไป)"
  | "อื่นๆ";

// ในส่วนของ MACRO_CATEGORIES list
export const MACRO_CATEGORIES: MacroCategory[] = [
  "Notebook & PC",
  "BUNDLE COMSET",
  "BUNDLE Notebook",
  "Component",
  "Monitor & Display",
  "Gaming & Stream",
  "Network & CCTV",
  "Printer",
  "Ink",
  "Accessories",
  "Clearance",
  "Services & Others",
  "เมาส์และคีย์บอร์ด (ทั่วไป)",
  "อื่นๆ"
];

// ปรับปรุงฟังก์ชัน getMacroCategory (ก่อนด่าน Accessories)
  if (
    typeLower.includes("mouse") || 
    typeLower.includes("keyboard")
  ) {
    return "เมาส์และคีย์บอร์ด (ทั่วไป)";
  }

  if (
    typeLower.includes("headphone") || 
    typeLower.includes("mic") || 
    typeLower.includes("speaker") || 
    ...
```

**Step 4: รันการทดสอบให้ผ่าน**
- รันคำสั่ง: `npx vitest run src/utils/categoryUtils.test.ts`
- คาดหวัง: ผลทดสอบผ่านฉลุย (PASS)

**Step 5: Commit การเปลี่ยนกลุ่มหมวดหมู่**
```bash
git add apps/web-app/src/utils/categoryUtils.ts apps/web-app/src/utils/categoryUtils.test.ts
git commit -m "feat: add เมาส์และคีย์บอร์ด (ทั่วไป) category and update mapping"
```

---

### Task 2: สร้างคอมโพเนนต์ StockDashboard

**Files:**
- Create: `apps/web-app/src/components/planner/StockDashboard.tsx`
- Create: `apps/web-app/src/components/planner/StockDashboard.test.tsx`

**Step 1: เขียน Unit Test สำหรับ StockDashboard**
สร้างไฟล์ `apps/web-app/src/components/planner/StockDashboard.test.tsx` เพื่อตรวจสอบการคำนวณสถิติ การแสดงผลแถบสี และการจำกัดจำนวนหมวดหมู่หลักสูงสุด 6 เซกเมนต์รวมกลุ่ม "อื่นๆ":
```typescript
import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { StockDashboard } from "./StockDashboard";
import { InventoryItem } from "../../types/planner";

const mockInventory: InventoryItem[] = [
  { code: "A1", product: "Item 1", itemType: "KEYBOARD", cost: 100, sellPrice: 200, qty: 5, stockValue: 500, projectedRevenue: 1000, margin: 500, agingDays: 10, agingBucket: "<90 days", store: "001", serial: "" },
  { code: "A2", product: "Item 2", itemType: "NOTEBOOK", cost: 1000, sellPrice: 1500, qty: 2, stockValue: 2000, projectedRevenue: 3000, margin: 1000, agingDays: 45, agingBucket: "<90 days", store: "001", serial: "" },
  { code: "A3", product: "Item 3", itemType: "PRINTER", cost: 500, sellPrice: 600, qty: 10, stockValue: 5000, projectedRevenue: 6000, margin: 1000, agingDays: 100, agingBucket: "90-119 days", store: "001", serial: "" }
];

describe("StockDashboard", () => {
  it("ควรคำนวณและเรนเดอร์ตัวชี้วัดทางการเงินถูกต้อง", () => {
    const { getByText } = render(<StockDashboard inventory={mockInventory} />);
    // ทุนรวม = 5*100 + 2*1000 + 10*500 = 7500
    // คาดการณ์รายได้ = 1000 + 3000 + 6000 = 10000
    // กำไร = 10000 - 7500 = 2500
    // อัตรากำไร = 25%
    expect(getByText(/7,500/)).toBeDefined();
    expect(getByText(/10,000/)).toBeDefined();
    expect(getByText(/2,500/)).toBeDefined();
    expect(getByText(/25%/)).toBeDefined();
  });
});
```

**Step 2: รันการทดสอบให้ Fail**
- รันคำสั่ง: `npx vitest run src/components/planner/StockDashboard.test.tsx`
- คาดหวัง: ล้มเหลวเนื่องจากคอมโพเนนต์ยังไม่ถูกสร้าง

**Step 3: เขียนโค้ดพัฒนาคอมโพเนนต์ StockDashboard.tsx**
สร้างโครงสร้างคอมโพเนนต์ที่คำนวณข้อมูลทางการเงิน, สัดส่วนอายุ, และประเภทสินค้าตามข้อกำหนด " Dynamic Grouping " พร้อม UI สไตล์ OLED ดำนีออนสะท้อนแสงและการตรวจจับ Hover:
```typescript
import React, { useState } from "react";
import { InventoryItem } from "../../types/planner";
import { getMacroCategory } from "../../utils/categoryUtils";

const moneyFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("th-TH", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function StockDashboard({ inventory }: { inventory: InventoryItem[] }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!inventory || !inventory.length) return null;

  // 1. คำนวณข้อมูลการเงิน
  let totalCost = 0;
  let totalRevenue = 0;
  let totalMargin = 0;
  let revenueForMargin = 0;

  for (const item of inventory) {
    totalCost += item.cost * item.qty;
    if (item.sellPrice !== null) {
      const itemRev = item.sellPrice * item.qty;
      totalRevenue += itemRev;
      revenueForMargin += itemRev;
      totalMargin += (item.sellPrice - item.cost) * item.qty;
    }
  }
  const avgMarginPercent = revenueForMargin > 0 ? totalMargin / revenueForMargin : 0;

  // 2. คำนวณ Aging
  let healthyQty = 0; // 0-30 days
  let warningQty = 0; // 31-90 days
  let criticalQty = 0; // 91+ days
  let totalQty = 0;

  for (const item of inventory) {
    totalQty += item.qty;
    const days = item.agingDays ?? 0;
    if (days <= 30) healthyQty += item.qty;
    else if (days <= 90) warningQty += item.qty;
    else criticalQty += item.qty;
  }

  // 3. จัดกลุ่มหมวดหมู่สินค้าแบบไดนามิก (Dynamic Grouping - Max 6 segments)
  const categoryTotals: Record<string, { qty: number; value: number }> = {};
  for (const item of inventory) {
    const cat = getMacroCategory(item.itemType);
    if (!categoryTotals[cat]) categoryTotals[cat] = { qty: 0, value: 0 };
    categoryTotals[cat].qty += item.qty;
    categoryTotals[cat].value += item.stockValue;
  }

  const allCategories = Object.keys(categoryTotals);
  const targetCategory = "เมาส์และคีย์บอร์ด (ทั่วไป)";
  const hasTarget = allCategories.includes(targetCategory);

  // ดึงหมวดหมู่อื่นๆ ที่ไม่ใช่เป้าหมาย
  const otherCats = allCategories.filter(cat => cat !== targetCategory && cat !== "อื่นๆ");
  otherCats.sort((a, b) => categoryTotals[b].value - categoryTotals[a].value);

  // เลือก Top 4 หมวดหมู่อื่น
  const top4Others = otherCats.slice(0, 4);
  const restCats = otherCats.slice(4);

  // สร้างอาร์เรย์สรุปกลุ่มสินค้า 6 กลุ่ม
  interface Segment {
    name: string;
    qty: number;
    value: number;
    color: string;
  }

  const colors = ["#06b6d4", "#10b981", "#8b5cf6", "#f59e0b"]; // Top 4 colors
  const segments: Segment[] = [];

  // เพิ่ม Top 4 ลงเซกเมนต์
  top4Others.forEach((cat, index) => {
    segments.push({
      name: cat,
      qty: categoryTotals[cat].qty,
      value: categoryTotals[cat].value,
      color: colors[index]
    });
  });

  // เพิ่ม "เมาส์และคีย์บอร์ด (ทั่วไป)"
  if (hasTarget && categoryTotals[targetCategory].qty > 0) {
    segments.push({
      name: targetCategory,
      qty: categoryTotals[targetCategory].qty,
      value: categoryTotals[targetCategory].value,
      color: "#6366f1"
    });
  }

  // รวมหมวดหมู่ที่เหลือทั้งหมดเป็น "อื่นๆ"
  let othersQty = 0;
  let othersValue = 0;
  restCats.forEach(cat => {
    othersQty += categoryTotals[cat].qty;
    othersValue += categoryTotals[cat].value;
  });
  if (categoryTotals["อื่นๆ"]) {
    othersQty += categoryTotals["อื่นๆ"].qty;
    othersValue += categoryTotals["อื่นๆ"].value;
  }

  if (othersQty > 0) {
    segments.push({
      name: "อื่นๆ",
      qty: othersQty,
      value: othersValue,
      color: "#78716c"
    });
  }

  const totalSegmentValue = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="panel stepPanel" style={{ marginBottom: "24px" }}>
      {/* 1. Header & Financial metrics */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#f5f5f7", marginBottom: "16px" }}>แดชบอร์ดสรุปข้อมูลสต็อกสินค้า</h2>
      
      <div className="summaryTiles" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <div className="metricTile" style={{ borderLeft: "4px solid #78716c" }}>
          <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>ทุนสะสม (Total Cost)</span>
          <strong style={{ fontSize: "1.2rem", color: "#f5f5f7" }}>{moneyFormatter.format(totalCost)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid #06b6d4" }}>
          <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>รายได้คาดการณ์ (Projected Rev)</span>
          <strong style={{ fontSize: "1.2rem", color: "#06b6d4" }}>{moneyFormatter.format(totalRevenue)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid #10b981" }}>
          <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>กำไรคาดการณ์ (Projected Margin)</span>
          <strong style={{ fontSize: "1.2rem", color: "#10b981" }}>{moneyFormatter.format(totalMargin)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>อัตรากำไรเฉลี่ย (Avg Margin %)</span>
          <strong style={{ fontSize: "1.2rem", color: "#8b5cf6" }}>{percentFormatter.format(avgMarginPercent)}</strong>
        </div>
      </div>

      {/* 2. Aging Distribution */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "#a8a29e" }}>การกระจายอายุสินค้า (Aging Distribution)</span>
          <span style={{ fontSize: "0.85rem", color: "#78716c" }}>ทั้งหมด {totalQty} ชิ้น</span>
        </div>
        <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", background: "#292524", marginBottom: "8px" }}>
          {healthyQty > 0 && <div style={{ width: `${(healthyQty / totalQty) * 100}%`, background: "#10b981" }} title="0-30 วัน" />}
          {warningQty > 0 && <div style={{ width: `${(warningQty / totalQty) * 100}%`, background: "#f59e0b" }} title="31-90 วัน" />}
          {criticalQty > 0 && <div style={{ width: `${(criticalQty / totalQty) * 100}%`, background: "#f43f5e" }} title="91+ วัน" />}
        </div>
        <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
            <span style={{ color: "#d6d3d1" }}>0-30 วัน (ปกติ): {healthyQty} ชิ้น ({percentFormatter.format(healthyQty / totalQty)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
            <span style={{ color: "#d6d3d1" }}>31-90 วัน (เฝ้าระวัง): {warningQty} ชิ้น ({percentFormatter.format(warningQty / totalQty)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f43f5e" }} />
            <span style={{ color: "#fca5a5", fontWeight: "bold" }}>91+ วัน (สินค้า Clearance): {criticalQty} ชิ้น ({percentFormatter.format(criticalQty / totalQty)})</span>
          </div>
        </div>
      </div>

      {/* 3. Category Allocation Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "#a8a29e" }}>สัดส่วนประเภทสินค้า (Category Allocation)</span>
        </div>
        {/* Dynamic Category Bar */}
        <div style={{ display: "flex", height: "20px", borderRadius: "6px", overflow: "hidden", background: "#292524", marginBottom: "12px", border: "1px solid #44403c" }}>
          {segments.map(seg => {
            const isHovered = hoveredCategory === seg.name;
            const hasHovered = hoveredCategory !== null;
            const opacity = hasHovered ? (isHovered ? 1 : 0.3) : 1;
            const shadow = isHovered ? "0 0 10px rgba(255,255,255,0.4) inset" : "none";
            const percent = (seg.value / totalSegmentValue) * 100;

            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredCategory(seg.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  width: `${percent}%`,
                  background: seg.color,
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity,
                  boxShadow: shadow,
                  cursor: "pointer"
                }}
                title={`${seg.name}: ${moneyFormatter.format(seg.value)}`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", transition: "opacity 0.2s ease" }}>
          {segments.map(seg => {
            const isHovered = hoveredCategory === seg.name;
            const hasHovered = hoveredCategory !== null;
            const opacity = hasHovered ? (isHovered ? 1 : 0.3) : 1;

            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredCategory(seg.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  opacity,
                  transition: "opacity 0.2s ease",
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: seg.color }} />
                <span style={{ color: "#d6d3d1", fontWeight: isHovered ? "bold" : "normal" }}>
                  {seg.name}: {seg.qty} ชิ้น ({moneyFormatter.format(seg.value)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 4: รันการทดสอบเพื่อให้ผ่าน**
- รันคำสั่ง: `npx vitest run src/components/planner/StockDashboard.test.tsx`
- คาดหวัง: ผ่านฉลุย (PASS)

**Step 5: Commit คอมโพเนนต์แดชบอร์ด**
```bash
git add apps/web-app/src/components/planner/StockDashboard.tsx apps/web-app/src/components/planner/StockDashboard.test.tsx
git commit -m "feat: implement StockDashboard component with dynamic category grouping"
```

---

### Task 3: ติดตั้ง Dashboard บนหน้าสรุปคลังสินค้า

**Files:**
- Modify: `apps/web-app/src/app/PlannerApp.tsx`

**Step 1: แก้ไขไฟล์ PlannerApp.tsx**
เพิ่มการ Import และใช้งาน `<StockDashboard inventory={state.inventory} />` ไว้เหนือ `<StockTablePanel ... />` ในไฟล์ `apps/web-app/src/app/PlannerApp.tsx`:
```typescript
// ลิงก์ที่ 6: นำเข้าคอมโพเนนต์
import { StockDashboard } from "../components/planner/StockDashboard";

// ... ค้นหาจุดเรนเดอร์ StockTablePanel แล้ววางแดชบอร์ดไว้ด้านบน
        <StockDashboard inventory={state.inventory} />

        <StockTablePanel 
          inventory={state.inventory} 
          onSelectProduct={handleSelectProduct} 
          onSearchPrice={handleSearchPrice} 
          loading={syncStockMutation.isPending} 
        />
```

**Step 2: รันการตรวจสอบความถูกต้องของการคอมไพล์**
- รันคำสั่งตรวจประเภทข้อมูล: `npx tsc --noEmit`
- คาดหวัง: ไร้ข้อผิดพลาด (No type errors)
- รันคำสั่งบิลด์งานโปรดักชัน: `npm run build`
- คาดหวัง: บิลด์ผ่านสำเร็จ

**Step 3: Commit หน้าเว็บหลัก**
```bash
git add apps/web-app/src/app/PlannerApp.tsx
git commit -m "feat: render StockDashboard above StockTablePanel in PlannerApp"
```

# แผนการปรับปรุง UI/UX แบบระบบการควบคุมนีออนเรืองแสง (UI/UX Redesign - Neon Cyber Workspace) Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** ปรับปรุงหน้าต่างการแสดงผล เมนูนำทาง ตารางข้อมูล ปฏิทิน และระบบสร้าง Prompt AI ของทั้ง 5 หน้าแอปพลิเคชันให้เป็นสไตล์สีสัน "Electric Neon Cyber" สลับสีน้ำเงิน/ดำคาร์บอน เรืองแสงสีฟ้าและเหลือง และปิดออฟฟิศพิกเซลเพื่อทำแบบเต็มหน้าจอถาวร

**Architecture:** อัปเดตตัวแปรชุดสีและเอฟเฟกต์เรืองแสงใน `globals.css` จากนั้นปลดล็อกตัวคลุม `VirtualOfficeLayout` ใน `layout.tsx` แล้วไล่ปรับปรุงเลย์เอาต์การนำเสนอ แถบ Pipeline Stepper ฟอร์มข้อมูล และสี Badge การ์ดรายหน้าให้สอดคล้องกันแบบ Responsive และเรียบแบนพรีเมียม

**Tech Stack:** Next.js, React, Tailwind CSS (หรือ CSS Classes หลัก), Vitest

---

### Task 1: ปรับปรุงสไตล์และสกินหลัก (Global Styles & Skins)

**Files:**
- Modify: `apps/web-app/src/app/globals.css`

**Step 1: ปรับสไตล์สีสัน พื้นหลังกริตเส้นไฟ และเอฟเฟกต์เรืองแสงหลัก**
ปรับแต่งส่วนต้นของ `apps/web-app/src/app/globals.css` เพื่อเพิ่มคลาสและเอฟเฟกต์นีออนสะท้อนแสง:
```css
/* แทนที่ตัวแปรหลักตั้งแต่บรรทัดที่ 1 */
:root {
  --color-oled-black: #02040a;
  --color-glass-border: rgba(14, 165, 233, 0.2);
  --color-glass-bg: rgba(10, 15, 30, 0.7);
  --color-text-primary: #fafaf9;
  --color-text-secondary: #94a3b8;
  --color-neon-cyan: #22d3ee;
  --color-neon-yellow: #facc15;
  --color-neon-yellow-hover: #eab308;
  --color-clearance-red: #ef4444;
  --color-warning-orange: #f97316;
  --transition-cubic: cubic-bezier(0.16, 1, 0.3, 1);
  --font-plus-jakarta: "Plus Jakarta Sans", "Noto Sans Thai", sans-serif;
  color-scheme: dark;
  background: var(--color-oled-black);
  color: var(--color-text-primary);
  font-family: var(--font-plus-jakarta);
}

/* เอฟเฟกต์ลายตารางเลเซอร์นีออนด้านหลังเพจ */
.appShell {
  min-height: 100vh;
  background-color: #020408;
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.15), transparent 70%),
    linear-gradient(rgba(34, 211, 238, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.02) 1px, transparent 1px);
  background-size: 100% 100%, 40px 40px, 40px 40px;
}

/* คลาสเอฟเฟกต์เรืองแสง */
.neon-glow-cyan {
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.15);
  border-color: rgba(34, 211, 238, 0.45) !important;
}

.neon-glow-yellow {
  box-shadow: 0 0 15px rgba(250, 204, 21, 0.2);
  border-color: rgba(250, 204, 21, 0.5) !important;
}

/* อัปเดตคลาสปุ่มหลัก */
.primaryButton {
  min-height: 42px;
  background: var(--color-neon-yellow);
  color: #02040a;
  border-radius: 8px;
  font-weight: 800;
  transition: all 0.3s var(--transition-cubic);
  border: 1px solid var(--color-neon-yellow);
}

.primaryButton:hover:not(:disabled) {
  background: var(--color-neon-yellow-hover);
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(250, 204, 21, 0.4);
}

/* อัปเดตคลาสปุ่มรอง */
.secondaryButton {
  min-height: 42px;
  background: rgba(14, 165, 233, 0.05);
  border: 1.5px solid rgba(14, 165, 233, 0.4);
  color: #fafaf9;
  font-weight: 800;
  transition: all 0.3s var(--transition-cubic);
}

.secondaryButton:hover:not(:disabled) {
  background: rgba(14, 165, 233, 0.15);
  border-color: var(--color-neon-cyan);
  box-shadow: 0 0 15px rgba(34, 211, 238, 0.25);
  transform: translateY(-1px);
}
```

**Step 2: รันคำสั่งบิลด์ตรวจสอบโครงร่าง CSS เพื่อทดสอบความถูกต้อง**
- รันคำสั่ง: `npm run build` จากโฟลเดอร์ `apps/web-app`
- คาดหวัง: บิลด์ผ่านสำเร็จ ไม่มีสไตล์ที่ทับซ้อนกันจนพัง

**Step 3: Commit การเปลี่ยนแปลงสไตล์และสีสกิน**
```bash
git add apps/web-app/src/app/globals.css
git commit -m "style: configure neon cyber colors and global skins in globals.css"
```

---

### Task 2: ติดตั้งเต็มหน้าจอถาวรและอัปเดตเมนูหลัก (App Shell & Sticky Header)

**Files:**
- Modify: `apps/web-app/src/app/layout.tsx`
- Modify: `apps/web-app/src/app/PlannerApp.tsx`
- Modify: `apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx`
- Modify: `apps/web-app/src/app/promotion-combo/PromotionComboApp.tsx`
- Modify: `apps/web-app/src/app/content-creator/ContentCreatorApp.tsx`

**Step 1: ปลดล็อกเลย์เอาต์ Virtual Office ใน layout.tsx**
ตรวจสอบว่าไฟล์ `apps/web-app/src/app/layout.tsx` เป็นแบบเต็มหน้าจอถาวร (ไม่มีการครอบด้วย `VirtualOfficeLayout`):
```typescript
// layout.tsx ควรส่งกลับ children ตรงๆ ภายใต้ Providers เหมือนที่ผู้ใช้ได้แก้ไขไว้
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased bg-gray-950">
        <Providers>
          <Toaster position="bottom-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Step 2: อัปเดตหน้าตาแถบเมนูนำทางและ Pipeline Stepper ใน PlannerApp.tsx และไฟล์แอปเพจอื่นๆ**
ปรับปรุงฟังก์ชันเรนเดอร์แถบเมนูนำทาง `topNav` และระบบ Stepper ให้มีโลโก้ Advice สีนีออนเรืองแสง และท่อสายไฟเรืองแสงวิ่งเชื่อมหากัน:
```typescript
// ในแต่ละหน้าแอปพลิเคชัน (PlannerApp, TrendPlannerApp, PromotionComboApp, ContentCreatorApp, guide/page.tsx)
// ปรับปรุงแถบเมนูนำทางให้พรีเมียมและเพิ่มโลโก้
<nav className="topNav" aria-label="เมนูหลัก">
  <div className="navBranding" style={{ display: 'flex', alignItems: 'center', marginRight: '24px', fontWeight: 900, fontSize: '1.2rem', color: '#fafaf9' }}>
    <span style={{ color: '#22d3ee', textShadow: '0 0 10px #22d3ee' }}>Advice</span>
    <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: '#facc15', border: '1px solid #facc15', padding: '2px 4px', borderRadius: '4px' }}>สามร้อยยอด</span>
  </div>
  <Link className={pathname === "/" ? "activeNav" : ""} href="/">แผนจากสต็อก</Link>
  <Link className={pathname === "/trend-planner" ? "activeNav" : ""} href="/trend-planner">แผนจากเทรนด์</Link>
  ...
</nav>

// ปรับปรุง Stepper ใน PlannerApp.tsx ให้มีแถบ Conduit สีฟ้านีออนเรืองแสงเชื่อมต่อ
// แทนที่ฟังก์ชัน Stepper ดั้งเดิมใน PlannerApp.tsx
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = ["อัปโหลดสต็อก", "เลือกสินค้า", "สร้าง Prompt", "คัดลอกไปเจนภาพ"];
  return (
    <div style={{ position: 'relative', margin: '32px 0 24px 0' }}>
      {/* ท่อสายไฟเชื่อมสเต็ป */}
      <div style={{ position: 'absolute', top: '25px', left: '12.5%', right: '12.5%', height: '4px', background: '#292524', zIndex: 1 }}>
        <div style={{ height: '100%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, transition: 'width 0.4s ease' }} />
      </div>
      
      <nav className="stepper" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative', zIndex: 2 }}>
        {steps.map((step, index) => {
          const active = currentStep === index + 1;
          const completed = currentStep > index + 1;
          return (
            <div 
              key={step} 
              className={`step ${active ? "activeStep" : ""}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: active ? 'rgba(34,211,238,0.1)' : (completed ? 'rgba(34,211,238,0.03)' : '#0a0d16'),
                borderColor: active ? '#facc15' : (completed ? '#22d3ee' : '#292524'),
                boxShadow: active ? '0 0 15px rgba(250,204,21,0.2)' : 'none',
                borderRadius: '12px',
                padding: '16px 12px',
                minHeight: 'auto',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{
                background: active ? '#facc15' : (completed ? '#22d3ee' : '#1c1917'),
                color: active || completed ? '#02040a' : '#a8a29e',
                boxShadow: active ? '0 0 10px #facc15' : (completed ? '0 0 8px #22d3ee' : 'none'),
                width: '32px',
                height: '32px',
                display: 'grid',
                placeItems: 'center',
                borderRadius: '50%',
                fontWeight: 800
              }}>
                {completed ? "✓" : index + 1}
              </span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: active ? '#fafaf9' : '#a8a29e', textAlign: 'center' }}>{step}</p>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
```

**Step 3: ตรวจสอบความถูกต้องของการคอมไพล์โค้ด**
- รัน Type check: `npx tsc --noEmit`
- คาดหวัง: ผ่าน ไร้ข้อผิดพลาด

**Step 4: Commit แผนโครงสร้าง App Shell**
```bash
git add apps/web-app/src/app/layout.tsx apps/web-app/src/app/PlannerApp.tsx apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx apps/web-app/src/app/promotion-combo/PromotionComboApp.tsx apps/web-app/src/app/content-creator/ContentCreatorApp.tsx
git commit -m "feat: implement sticky neon header and pipeline stepper across all pages"
```

---

### Task 3: ปรับแต่งหน้าแผนจากสต็อก (Redesign Stock Plan Page)

**Files:**
- Modify: `apps/web-app/src/components/planner/StockDashboard.tsx`
- Modify: `apps/web-app/src/components/planner/StockTablePanel.tsx`

**Step 1: ปรับแต่งสถิติและแถบ Dynamic Category ใน StockDashboard.tsx**
ปรับแต่งสีนีออน การเรืองแสง และสเปซในแดชบอร์ดสรุป:
```typescript
// ในไฟล์ StockDashboard.tsx ตกแต่งส่วนหัวข้อและกล่องตัวชี้วัด (Metrics) ให้สว่างพรีเมียม
// เพิ่มการ์ดสถิติต้นทุน คาดการณ์รายได้ กำไร ด้วยสีฟ้านีออนและสีเหลืองนีออนเรืองแสง
// ปรับสเปซขอบและการเคลื่อนเมาส์ผ่าน (Hover)

// ในส่วนของแถบจัดกลุ่มประเภทสินค้า ให้หมวดหมู่ "เมาส์และคีย์บอร์ด (ทั่วไป)" มีสีแดง/ชมพูนีออนสว่างเด่น
const colors = ["#06b6d4", "#22c55e", "#8b5cf6", "#fb923c"]; // เปลี่ยนเฉดสีให้ตรงตามดีไซน์พรีเมียม
```

**Step 2: อัปเดตหน้าตารางคลังสินค้า ตกแต่งป้าย Clearance เรืองแสงกะพริบ**
ในไฟล์ `StockTablePanel.tsx` เพิ่มแท็ก `Clearance` เรืองแสงกะพริบสีแดงสำหรับรายการค้างสต็อก 91+ วัน:
```typescript
// แทนที่การเรนเดอร์ส่วน Aging ใน StockTablePanel.tsx เพื่อเพิ่มแท็ก Clearance นีออนสีแดงกะพริบ
<td style={{ padding: '10px', textAlign: 'right' }}>
  {item.agingDays !== undefined && item.agingDays !== null ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      <span style={{ color: item.agingDays >= 91 ? '#fca5a5' : '#d6d3d1', fontWeight: item.agingDays >= 91 ? 'bold' : 'normal' }}>
        {item.agingDays} วัน
      </span>
      {item.agingDays >= 91 && (
        <span 
          className="animate-pulse"
          style={{ 
            fontSize: '0.65rem', 
            background: 'rgba(239,68,68,0.15)', 
            color: '#ef4444', 
            border: '1px solid #ef4444', 
            padding: '2px 6px', 
            borderRadius: '4px',
            textShadow: '0 0 5px #ef4444',
            boxShadow: '0 0 8px rgba(239,68,68,0.3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        >
          🚨 CLEARANCE
        </span>
      )}
    </div>
  ) : "-"}
</td>
```

**Step 3: รัน Unit Test ตรวจตารางและแดชบอร์ด**
- รันการทดสอบ: `npx vitest run src/components/planner/`
- คาดหวัง: ผ่านสำเร็จทั้งหมด (PASS)

**Step 4: Commit การตกแต่งหน้าวิเคราะห์สต็อก**
```bash
git add apps/web-app/src/components/planner/StockDashboard.tsx apps/web-app/src/components/planner/StockTablePanel.tsx
git commit -m "feat: design visual clearance tags and neon highlights in stock planner"
```

---

### Task 4: ปรับปรุงหน้าแผนจากเทรนด์และหน้าสร้างคอนเทนต์ด้วย AI

**Files:**
- Modify: `apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx`
- Modify: `apps/web-app/src/app/content-creator/ContentCreatorApp.tsx`

**Step 1: ปรับแต่งกริดเทรนด์รายวันและการแสดงผล Bento Card ใน TrendPlannerApp.tsx**
อัปเดตไฟล์ `TrendPlannerApp.tsx` ให้ใช้กล่องดีไซน์ Bento กรมท่าลึก ขอบนีออนฟ้า และไฟเน้นสีเหลือง:
```typescript
// ใน TrendPlannerApp.tsx ตกแต่งส่วน Trend Radar Card และ Trend Snapshot
// ให้กล่องข้อมูลเทรนด์เป็นสเปซขอบคม แผ่น Panel นีออนสีขาวเรืองแสงและปุ่มบันทึกสีเหลืองเด่นสะดุดตา
```

**Step 2: จัดระเบียบ Bento AI Creator Layout และปุ่มก๊อปปี้สีเหลืองนีออนใน ContentCreatorApp.tsx**
ปรับปรุงฟอร์มและส่วนแสดง Prompt คัดลอกในหน้าสร้างคอนเทนต์ด้วย AI:
```typescript
// ปรับปรุงผลลัพธ์จาก AI (Result Panel) ใน ContentCreatorApp.tsx
// ช่องภาษาอังกฤษให้ใช้สีฟ้านีออน และช่องแสดง Prompt ป้าย Badges คัดลอกใช้ปุ่มกดสีเหลืองนีออนส่องสว่างสูงสุด
```

**Step 3: รันคำสั่งตรวจทานการคอมไพล์โปรเจกต์**
- รันคำสั่งตรวจประเภทข้อมูล: `npx tsc --noEmit`
- รันคำสั่งบิลด์งานสำหรับใช้งานจริง: `npm run build`
- คาดหวัง: ผ่านทั้งหมดอย่างสมบูรณ์ ไร้ข้อผิดพลาด

**Step 4: Commit ปิดการปรับปรุงหน้า Radar และ AI Creator**
```bash
git add apps/web-app/src/app/trend-planner/TrendPlannerApp.tsx apps/web-app/src/app/content-creator/ContentCreatorApp.tsx
git commit -m "feat: redesign bento grids and neon yellow CTA buttons in trend radar and ai creator"
```

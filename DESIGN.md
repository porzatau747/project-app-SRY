---
name: Weekly Content Planner Design System
description: Modern Cyberpunk OLED design system with vibrant neon accents and clear hierarchy for stock analytics.
colors:
  primary: "#22d3ee"
  neutral-bg: "#050505"
  surface-card: "#1c1917"
  border-subtle: "#292524"
  text-primary: "#fafaf9"
  text-secondary: "#a8a29e"
  alert-critical: "#ef4444"
  alert-warning: "#f97316"
  success-accent: "#22c55e"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Noto Sans Thai, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.4rem)"
    fontWeight: 800
    lineHeight: 1.08
  body:
    fontFamily: "Plus Jakarta Sans, Noto Sans Thai, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#0c0a09"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "#67e8f9"
---

# Design System: Weekly Content Planner

## 1. Overview

**Creative North Star: "The Neon Terminal"**

ระบบการออกแบบโฆษณาและสต็อกที่เน้นบรรยากาศแบบกึ่งห้องทดลองกึ่งศูนย์บัญชาการล้ำสมัย (Cyberpunk Workspace) โดดเด่นด้วยการใช้หน้าจอสีดำสนิทระดับ OLED Black (`#050505`) ร่วมกับการตัดกันของแสงสีนีออน Cyan (`#22d3ee`) และการสรุปข้อมูลระดับความด่วนของอายุสต็อก (Aging) ด้วยสีส้มกึ่งแดง (Clearance Alert Ramps) ให้ความรู้สึกฉับไว ตอบสนองรวดเร็ว และเน้นความชัดเจนของข้อมูลเชิงสถิติโดยไม่ต้องพึ่งพาระดับความลึกของการ์ดซ้อนการ์ด

**Key Characteristics:**
- **Absolute Dark Contrast:** พื้นหลังดำสนิทคู่กับตัวอักษรสีขาวสว่างและเนีอนฟ้า
- **Flat Layout Plane:** วางชิ้นงานในระนาบแบนที่มีการแบ่งส่วนการมองเห็นอย่างเด่นชัดโดยไร้เงาขอบที่ซับซ้อน
- **Color-Coded Urgency:** ลำดับสายตาผู้ใช้ด้วยสีบอกอุณหภูมิความด่วน (ส้ม/แดงสำหรับสินค้า Clearance)

## 2. Colors

ชุดสีหลักสะท้อนความเป็นหน้าจอแสดงผลเทคนิคอลไอทีและมีความเร่งด่วนของคลังสินค้า

### Primary
- **Neon Cyan** (`#22d3ee` / `oklch(78.9% 0.174 207.5)`): สีนำสายตาและปุ่มปฏิบัติการหลัก (Call to Action) สื่อถึงพลังเทคโนโลยีและความใหม่สด
- **Bright Cyan** (`#67e8f9`): สีสำหรับตัวอักษรเน้นย้ำและสถานะความก้าวหน้า

### Alert
- **Clearance Red** (`#ef4444`): สื่อถึงสถานะสินค้าที่เก่าและค้างสต็อกขั้นวิกฤต (Aging 91+ วัน) ที่ต้องการผลักดันทำโปร Clearance ด่วนที่สุด
- **Urgent Orange** (`#f97316`): สื่อถึงสินค้าค้างสต็อกระยะปานกลาง (Aging 31-90 วัน) ที่ควรเริ่มทำโพสต์ขายลดราคา

### Neutral
- **OLED Black** (`#050505`): สีพื้นหลังระบบหลักเพื่อลดความเมื่อยล้าสายตา
- **Warm Dark Stone** (`#1c1917`): สีพื้นหลังของแผงควบคุม (Panel Surfaces)
- **Stone Border** (`#292524`): สีเส้นขอบแบ่งขอบเขตหน้าจอ
- **Stone Ink Primary** (`#fafaf9`): สีตัวอักษรหลัก
- **Stone Ink Secondary** (`#a8a29e`): สีคำอธิบายตัวย่อยและตัวนำสายตาระดับรอง

### Named Rules
**The 10% Cyan Rule.** จำกัดการใช้สีนีออนฟ้าเฉพาะในจุดสำคัญ เช่น ปุ่มหลักหรือสถานะการทำงานเท่านั้น การใส่สีสว่างมากเกินไปจะลดทอนพลังความเด่นในจุดที่เป็น Core Actions

## 3. Typography

**Display Font:** Plus Jakarta Sans และ Noto Sans Thai
**Body Font:** Plus Jakarta Sans และ Noto Sans Thai

### Hierarchy
- **Display** (ExtraBold (800), `clamp(2rem, 4vw, 3.4rem)`, `1.08`): หัวข้อหลักของเพจ ดึงดูดสายตาอย่างดี
- **Headline / Section Title** (Bold (700), `1.25rem` / `20px`, `1.4`): ใช้ระบุแถบสถิติหรือหัวข้อความคืบหน้าของฟังก์ชัน
- **Body Text** (Regular (400), `14px`, `1.7`): ใช้สำหรับรายละเอียดข้อมูลและข้อความอธิบายความยาวไม่เกิน 70ch
- **Label / Small** (Bold (700), `0.78rem` / `12px`, uppercase): ใช้บนแผ่น Badge สถานะและหัวข้อขั้นตอนขนาดเล็ก

## 4. Elevation

ระบบจะวางแผนผังบนแนวราบแบนเกือบทั้งหมด (Flat Architecture) ปราศจากการสร้างระดับความลึกด้วยเงาแบบดั้งเดิม โดยเน้นความลึกผ่านขอบเขตเส้นขอบแบบคมชัดและระดับความโปร่งใสของพื้นหลังกระจกเงา (Backdrop blur)

### Named Rules
**The Border-Cut Doctrine.** ขอบเขตระหว่างพื้นที่ควบคุมถูกตัดขาดอย่างชัดเจนด้วยเส้นขอบหนา 1px สี `#292524` ห้ามปล่อยให้ขอบกลืนกันเด็ดขาด

## 5. Components

### Buttons
- **Shape:** มนเล็กน้อย (8px)
- **Primary:** พื้นหลังสี Neon Cyan (`#22d3ee`) ตัวหนังสือสีถ่านเข้ม `#0c0a09` หนาพิเศษ มีความเปรียบต่างสูง (Contrast > 7:1)
- **Hover:** เพิ่มการเปล่งแสงหรือขยับขนาดสว่างขึ้นเป็น Bright Cyan (`#67e8f9`)

### Cards / Panels
- **Corner Style:** 8px
- **Background:** พื้นหลังคุมโทนสี `#1c1917` มีขอบสีเข้มและโปร่งแสงรอบแผง
- **Shadow:** ไม่มีเงารอบตัวการ์ด ใช้ขอบเขตเส้นและสีกระจายตัวระบุพิกัดแทน

### Progress Bars / Status Rings
- **Visual:** แถบสถานะแบบ SVG/HTML แท้ ไล่ระดับหรือใช้สีเดี่ยวตามน้ำหนักความด่วน
- **Clearance Indicators:** แถบส่วนสูงของสินค้าค้างสต็อกที่จะปรากฏขีดสีแดง/ส้มเมื่อปริมาณเกินลิมิต

## 6. Do's and Don'ts

### Do:
- **Do** ใช้แถบสีส้มและแดงสำหรับสถิติสินค้าค้างสต็อก (Aging) เพื่อแบ่งกลุ่มระดับความเร่งด่วนอย่างชัดเจน
- **Do** แสดงสัดส่วนประเภทสินค้าด้วยแถบสเกลสีสันสดใสแบบ Flat Bar ด้านบนของตาราง
- **Do** รักษาเส้นขอบให้อยู่ที่ 1px และสีตรงตามโครงสร้างโทน Stone เสมอ

### Don't:
- **Don't** ใช้ตารางซ้อนตาราง หรือการวางการ์ดบรรจุข้อความหลักลงไปในการ์ดควบคุมใหญ่ (Nested Cards)
- **Don't** ติดตั้งห้องสมุดทำกราฟรูปวงกลมหรือกราฟแท่งภายนอกที่มีขนาดยุ่งยาก ให้สร้างด้วยองค์ประกอบ HTML/CSS ในแอปพลิเคชัน
- **Don't** ใช้สีเทาอ่อนที่มีค่า Contrast ต่ำกว่า 4.5:1 สำหรับข้อมูลรหัสสินค้าหรือราคา

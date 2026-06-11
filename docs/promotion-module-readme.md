# Promotion Content Module

## Purpose
Promotion Content Module เป็น module แยกสำหรับสร้างคอนเทนต์โปรโมชันจากข้อมูล stock และราคากลางที่มีอยู่แล้วในระบบ โดยไม่แก้ระบบดึง stock, ระบบค้นหาราคา หรือ pricing logic เดิม

## Workflow
1. อ่านข้อมูลสินค้าจาก `readPlannerState().inventory`
2. Promotion Engine คัดสินค้าโปรโมชันจาก aged stock, discount-ready stock, high-margin stock และ seasonal IT products
   - สินค้าชื่อซ้ำจะแสดงแค่รายการเดียว โดยเลือกชิ้นที่ `agingDays` สูงที่สุด
   - ผู้ใช้กรอกราคาทุนขั้นต่ำได้ สินค้าที่ต้นทุนต่ำกว่าค่านี้จะไม่แสดงใน candidates
   - เลือก campaign type ได้ เช่น clearance, limited-stock, back-to-school, gaming-upgrade
   - เลือก Canva template preset ได้ เช่น clearance, notebook, gaming-gear, printer, accessory
3. AI Copy Generator สร้างข้อความภาษาไทยจากข้อมูลจริงเท่านั้น
4. ผู้ใช้ review และ approve รายการ
   - แก้ headline, body copy, Facebook caption และ disclaimer ได้ก่อน approve
   - แก้ price text, CTA และ hashtags ได้ก่อน export
   - ใช้ `Approve All` ได้เมื่อ batch ผ่านการตรวจแล้ว
5. Export CSV สำหรับ Canva Bulk Create
   - มี CSV preview ก่อน export
   - มี validation กัน export ถ้า headline, priceText, CTA หรือ caption ว่าง
   - มี batch history สำหรับกลับมาแก้หรือ export ซ้ำ
6. ผู้ใช้นำ CSV เข้า Canva เพื่อสร้างภาพเอง

## Safety Rules
- ไม่ auto-post Facebook
- ไม่ generate รูปภาพโดยตรง
- ไม่แต่งสเปคสินค้า
- ถ้าราคาไม่มี จะใช้ fallback เช่น `ทักแชตเพื่อเช็กราคาขายล่าสุด`
- จำกัด batch สูงสุด 500 สินค้า

## Main Files
- `apps/web-app/src/app/promotions/page.tsx`
- `apps/web-app/src/app/promotions/PromotionPlannerApp.tsx`
- `apps/web-app/src/services/promotion-engine.ts`
- `apps/web-app/src/services/promotion-copy-generator.ts`
- `apps/web-app/src/services/facebook-caption-generator.ts`
- `apps/web-app/src/services/canva-csv-exporter.ts`
- `apps/web-app/src/services/promotion-storage.ts`
- `apps/web-app/src/app/api/promotions/*`
- `apps/web-app/src/types/promotion.ts`

## Storage
Runtime ปัจจุบันเก็บ batch ที่ `data/promotion-batches.json` เพื่อไม่กระทบ `data/planner-state.json`

Prisma schema และ migration SQL ถูกเพิ่มไว้สำหรับรองรับ database workflow ภายหลัง:
- `PromotionBatch`
- `PromotionItem`
- `PromotionExport`

## Testing
```powershell
npm.cmd exec --workspace=web-app -- vitest run
npm.cmd run build
```

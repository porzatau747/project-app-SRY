# Canva Bulk Create Workflow

## Goal
ใช้ CSV จากหน้า `Promotion Bulk` เพื่อสร้างดีไซน์โปรโมชันหลายสินค้าใน Canva โดยให้ Canva เป็นเครื่องมือออกแบบ/export ภาพ

## Steps
1. เข้าแอพที่หน้า `Promotion Bulk`
2. กด `รีเฟรชจาก stock/price ล่าสุด`
3. เลือก `Campaign Type` เช่น เคลียร์สต็อก, โปรราคาพิเศษ, Back to School หรือ Gaming Upgrade
4. เลือก `Canva Template` เช่น Clearance, Notebook, Gaming Gear, Printer หรือ Accessory
5. กรอกราคาทุนขั้นต่ำถ้าต้องการตัดสินค้าต้นทุนต่ำออกจากรายการ
6. ใช้ filter หมวดสินค้า/เหตุผลโปรโมชันเพื่อเลือกสินค้า ไม่เกิน 500 รายการ
7. กด `สร้าง batch + copy ภาษาไทย`
8. ตรวจ headline, price text, body copy, CTA, hashtags และ Facebook caption
9. ถ้าข้อความยังไม่พร้อม ให้แก้ copy ในหน้า review แล้วกด `Save Copy`
10. ดู `CSV Preview` เพื่อตรวจ field สำคัญก่อน export
11. กด `Approve` เฉพาะรายการที่พร้อมใช้ หรือ `Approve All` เมื่อทั้ง batch ตรวจครบแล้ว
12. กด `Export Canva CSV`
13. เปิด Canva และเลือก design template ที่เตรียมไว้
14. ไปที่ `Apps` หรือ `Bulk Create`
15. Upload CSV ที่ export จากระบบ
16. Map field เช่น `headline`, `product_name`, `price_text`, `cta`, `disclaimer`, `campaign_type`, `template_preset`
17. Generate designs
18. ตรวจภาพใน Canva อีกครั้งก่อน export/post

## Recommended Canva Fields
- `headline`
- `campaign_type`
- `template_preset`
- `subheadline`
- `product_name`
- `price_text`
- `body_copy`
- `cta`
- `disclaimer`

## Notes
- CSV เป็น UTF-8 with BOM เพื่อช่วยให้ภาษาไทยเปิดใน Excel/Canva ได้ถูกต้อง
- ระบบไม่ใส่รูปสินค้าให้โดยอัตโนมัติ
- ระบบไม่โพสต์ Facebook ให้ ผู้ใช้ต้องตรวจและโพสต์เอง
- ถ้าราคาไม่มีในระบบ CSV จะใช้ข้อความ fallback ให้ทักเช็กราคาแทนการเดาราคา

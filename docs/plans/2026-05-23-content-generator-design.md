# AI Content Creator - Design Doc

**Date:** 2026-05-23
**Feature:** AI Content Creator Tab (Gemini API Integration)

## 1. Goal
สร้างแท็บ/หน้าต่างใหม่สำหรับแอปพลิเคชัน Weekly Content Planner ที่ช่วยผู้ใช้งานคิดและเขียนคอนเทนต์ (ทิปส์ไอที, ทิปส์เลือกซื้อสินค้า, หรือคอนเทนต์การตลาด) โดยอาศัยพลังของ Gemini API 

## 2. Approach Chosen: "Template Wizard" + "Free-text" (Hybrid)
หลังจากได้รับการยืนยันจากผู้ใช้ เราเลือกใช้รูปแบบผสมผสาน โดยเน้น **Template Wizard** (Option 2) เพื่อความรวดเร็วและเป็นมืออาชีพ แต่เสริมโหมด **Free-text (พิมพ์สั่งเอง)** (Option A) เอาไว้ในตัวเลือกด้วย เพื่ออิสระสูงสุดเมื่อต้องการพิมพ์คำสั่งเอง

## 3. Architecture & Data Flow
1. **Frontend (`src/app/content-creator/page.tsx`):**
   - มีเมนู Dropdown เลือกประเภท: ทิปส์ไอที, เลือกซื้อสินค้า, โปรโมชัน, หรือพิมพ์คำสั่งเอง (Free-text)
   - หากเลือกพิมพ์คำสั่งเอง จะแสดงกล่อง Textarea ขนาดใหญ่
   - ปุ่ม "Generate with Gemini"
   - กล่องขวา: ผลลัพธ์คอนเทนต์ที่ AI ร่างขึ้นมาให้ 
2. **Backend (`src/app/api/generate-content/route.ts`):**
   - รับ Input จากผู้ใช้ผ่าน HTTP POST
   - ประกบ Input เข้ากับ System Prompt ของแต่ละ Template 
   - เรียกใช้งาน Google Gemini API (`gemini-2.5-flash`) เพื่อดึงเนื้อหา
   - ส่งคืน JSON ข้อความกลับไปแสดงผลที่หน้าจอ

## 4. Components Required
- `ContentCreatorApp.tsx`: หน้า Layout หลัก 
- `InputForm.tsx`: กล่องข้อความกรอกรายละเอียด (มีทั้ง input และ textarea สลับตาม template)
- `ResultViewer.tsx`: กล่องแสดงผลลัพธ์

## 5. Next Steps
- ดำเนินการสร้างไฟล์ Implementation Plan ตามมาตรฐาน TDD/DRY/YAGNI และสร้างไฟล์ย่อยตามที่ออกแบบไว้

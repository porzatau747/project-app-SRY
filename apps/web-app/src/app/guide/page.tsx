import Link from "next/link";
import React from "react";

export default function GuidePage() {
  return (
    <main className="appShell">
      <div className="appPage">
        <nav className="topNav" aria-label="เมนูหลัก">
          <Link href="/">แผนจากสต็อก</Link>
          <Link href="/trend-planner">แผนจากเทรนด์</Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link className="activeNav" href="/guide">คู่มือการใช้งาน</Link>
        </nav>

        <header className="appHero" style={{ marginBottom: '20px' }}>
          <div>
            <p className="eyebrow">User Guide</p>
            <h1>คู่มือการใช้งาน Weekly Content Planner</h1>
            <p className="intro">
              ระบบวางแผนและจัดการคอนเทนต์แบบครบวงจรสำหรับร้าน Advice สามร้อยยอด ที่จะช่วยเปลี่ยนข้อมูลสต็อกและกระแสไอที ให้กลายเป็นตารางโพสต์ 7 วันพร้อม Prompt AI อย่างง่ายดาย
            </p>
          </div>
        </header>

        <div className="panel" style={{ padding: '30px', lineHeight: '1.7', color: '#d6d3d1' }}>
          
          <h2 style={{ color: '#fff', borderBottom: '1px solid #292524', paddingBottom: '10px', marginTop: '0' }}>
            📦 1. หน้า แผนจากสต็อก (Stock Planner)
          </h2>
          <p>หน้านี้ใช้สำหรับวิเคราะห์ข้อมูลสต็อกสินค้าของร้าน เพื่อคัดเลือกสินค้ามาทำโปรโมชันหรือนำมาสร้างเป็นคอนเทนต์</p>
          <ul style={{ marginLeft: '20px', marginBottom: '30px' }}>
            <li><strong>ดึงข้อมูลสต็อกและราคากลาง:</strong> เมื่อกดปุ่ม ระบบจะส่งบอท (แบบล่องหน) ไปดึงข้อมูลสต็อกและราคาขายล่าสุดจากระบบ Nescen ของร้านโดยอัตโนมัติ โดยจะแสดงเวลา "อัปเดตล่าสุด" ด้านล่างปุ่มเสมอ</li>
            <li><strong>การบวกกำไร (Markup):</strong> ระบบจะบวกกำไรเข้ากับราคากลางโดยอัตโนมัติ ตามเงื่อนไขดังนี้:
              <ul style={{ marginLeft: '20px', color: '#a8a29e' }}>
                <li>สินค้าราคา &lt; 500 บาท: <strong>+30%</strong></li>
                <li>สินค้าราคา 500 - 1,000 บาท: <strong>+15%</strong></li>
                <li>สินค้าราคา &gt; 1,000 บาท: <strong>+10%</strong></li>
                <li><em>ข้อยกเว้น:</em> Notebook <strong>+2,000 บาท</strong>, Printer และ Monitor <strong>+300 บาท</strong></li>
                <li>ราคาสุทธิจะถูก <strong>ปัดเศษหลักหน่วยเป็น 0 เสมอ</strong></li>
              </ul>
            </li>
            <li><strong>ค้นหาราคาจากเว็บ Advice:</strong> หากสินค้าใดไม่มีราคากลางในตาราง คุณสามารถกดปุ่ม "ค้นหาราคา" ท้ายรายการสินค้านั้น บอทจะวิ่งไปหาข้อมูลจากเว็บ advice.co.th และ <strong>บันทึกราคานั้นไว้ให้ใช้งานแบบถาวร</strong></li>
            <li><strong>ตัวกรองหมวดหมู่:</strong> เราได้จัดกลุ่มสินค้ากว่า 90 ชนิด ให้เหลือเพียง <strong>9 กลุ่มหลัก</strong> คุณสามารถติ๊กเลือกเฉพาะหมวดหมู่ที่สนใจ (เช่น Notebook & PC, Accessories) เพื่อกรองดูสินค้าในตารางได้อย่างง่ายดาย</li>
            <li><strong>Aging (อายุสินค้า):</strong> ช่วยบอกว่าสินค้านั้นค้างอยู่ในคลังมากี่วัน เหมาะแก่การนำมาทำคอนเทนต์ประเภท Clearance</li>
          </ul>

          <h2 style={{ color: '#fff', borderBottom: '1px solid #292524', paddingBottom: '10px' }}>
            📈 2. หน้า แผนจากเทรนด์ (Trend Planner)
          </h2>
          <p>หน้านี้ใช้สำหรับวางแผนตารางโพสต์ล่วงหน้า 7 วัน โดยอิงจากกระแสและข่าวสารล่าสุดในวงการไอที</p>
          <ul style={{ marginLeft: '20px', marginBottom: '30px' }}>
            <li><strong>อัปเดตกระแสล่าสุด:</strong> ระบบจะใช้ AI รวบรวมข่าวสารจากเว็บไซต์ไอทีชั้นนำ และเพจ Facebook ต่างๆ เพื่อคัดกรองว่าช่วงนี้มีเรื่องอะไรที่กำลังเป็นกระแส (Viral) หรือมีทิปส์การใช้งานที่น่าสนใจ</li>
            <li><strong>สร้างแผน 7 วันด้วย AI:</strong> เพียงกดปุ่ม ระบบจะนำสินค้าเด่นในสต็อก ผสมผสานกับข่าวที่กำลังเป็นกระแส มาจัดตารางเป็นปฏิทินโพสต์ 7 วัน โดยครอบคลุมทั้งโพสต์ขายของ (Sales), ข่าว (News), มุกตลก (Meme), และสร้างการมีส่วนร่วม (Engagement)</li>
            <li><strong>Export:</strong> สามารถกดปุ่ม "ดาวน์โหลดเป็น Excel" เพื่อส่งออกตารางทั้งหมดเป็นไฟล์ <code>.xlsx</code> ไปใช้ส่งมอบงานต่อได้ทันที</li>
          </ul>

          <h2 style={{ color: '#fff', borderBottom: '1px solid #292524', paddingBottom: '10px' }}>
            🤖 3. หน้า สร้างคอนเทนต์ด้วย AI (AI Content Creator)
          </h2>
          <p>หน้านี้คือผู้ช่วยคิดแคปชันและเขียนคำสั่ง (Prompt) เพื่อนำไปสั่ง AI วาดภาพ (เช่น Midjourney) ในการทำรูปโปรโมท</p>
          <ul style={{ marginLeft: '20px', marginBottom: '30px' }}>
            <li><strong>เลือกรูปแบบงาน (Template):</strong> มีเทมเพลตให้เลือกหลายแบบ เช่น ป้ายโปรโมท Notebook, อุปกรณ์ Gaming, หรือรูปป้าย Clearance </li>
            <li><strong>ใส่ข้อมูล / วางลิงก์:</strong> สามารถวางรหัสสินค้า หรือใส่ข้อมูลที่ต้องการให้ AI วิเคราะห์</li>
            <li><strong>สร้าง Prompt โฆษณา:</strong> AI จะคิด <em>แคปชันสำหรับโพสต์โซเชียลมีเดีย</em> ที่น่าสนใจ พร้อมกับ <em>Prompt สั่งวาดภาพภาษาอังกฤษ</em> โดยอิงอัตราส่วนและโทนสี (Corporate Identity) ที่เหมาะสม</li>
            <li><strong>ใช้งานต่อทันที:</strong> สามารถกดไอคอนคัดลอก (Copy) เพื่อนำข้อความเหล่านั้นไปแปะในระบบสร้างภาพ หรือโพสต์ลง Facebook ได้ทันที</li>
          </ul>

          <div style={{ marginTop: '40px', padding: '15px', background: '#292524', borderRadius: '8px', borderLeft: '4px solid #f97316' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>💡 ทิปส์การใช้งาน</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a8a29e' }}>
              ข้อมูลสถานะต่างๆ (เช่น ราคาสินค้า, แผนคอนเทนต์) จะถูก <strong>บันทึกอยู่ในระบบอัตโนมัติ</strong> คุณสามารถสลับหน้าไปมา หรือปิดโปรแกรมแล้วเปิดใหม่ ข้อมูลเดิมก็จะยังคงอยู่จนกว่าจะกด "ดึงข้อมูลใหม่" อีกครั้งครับ
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

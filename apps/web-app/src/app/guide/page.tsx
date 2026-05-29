import Link from "next/link";
import React from "react";
import { FadeUpReveal } from "../../components/ui/FadeUpReveal";

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

        <header className="appHero" style={{ marginBottom: '32px' }}>
          <div>
            <p className="eyebrow">User Guide</p>
            <h1>คู่มือการใช้งาน Weekly Content Planner</h1>
            <p className="intro">
              ระบบวางแผนและจัดการคอนเทนต์แบบครบวงจรสำหรับร้าน Advice สามร้อยยอด ที่จะช่วยเปลี่ยนข้อมูลสต็อกและกระแสไอที ให้กลายเป็นตารางโพสต์ 7 วันพร้อม Prompt AI อย่างง่ายดาย
            </p>
          </div>
        </header>

        <section className="bento-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <FadeUpReveal delay={100} className="double-bezel-outer">
            <div className="double-bezel-inner" style={{ padding: '32px', lineHeight: '1.7' }}>
              <h2 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginTop: '0', fontSize: '1.5rem' }}>
                📦 1. หน้า แผนจากสต็อก (Stock Planner)
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>หน้านี้ใช้สำหรับวิเคราะห์ข้อมูลสต็อกสินค้าของร้าน เพื่อคัดเลือกสินค้ามาทำโปรโมชันหรือนำมาสร้างเป็นคอนเทนต์</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>ดึงข้อมูลสต็อกและราคากลาง:</strong> ระบบสามารถจำลองการดึงข้อมูลและจัดการราคาขายล่าสุดจากระบบของร้าน</li>
                <li style={{ marginBottom: '12px' }}><strong>การบวกกำไร (Markup):</strong> ระบบช่วยบวกกำไรตามช่วงราคาของสินค้า เช่น สินค้า &lt; 500 บาท บวก 30% หรือ Notebook บวก 2,000 บาทอัตโนมัติ</li>
                <li style={{ marginBottom: '12px' }}><strong>ค้นหาราคาจากเว็บ Advice (Scraping):</strong> หากสินค้าใดไม่มีราคากลาง บอท (Web Scraper) จะวิ่งไปดึงข้อมูลราคาล่าสุดจากเว็บ advice.co.th และบันทึกไว้ในระบบ</li>
                <li style={{ marginBottom: '12px' }}><strong>ตัวกรองหมวดหมู่:</strong> กรองดูสินค้าตาม 9 กลุ่มหลัก (เช่น Notebook & PC, Accessories) เพื่อความรวดเร็ว</li>
                <li><strong>Aging (อายุสินค้า):</strong> ติดตามอายุสินค้าในคลังเพื่อวางแผนจัด Clearance Sale</li>
              </ul>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={200} className="double-bezel-outer">
            <div className="double-bezel-inner" style={{ padding: '32px', lineHeight: '1.7' }}>
              <h2 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginTop: '0', fontSize: '1.5rem' }}>
                📈 2. หน้า แผนจากเทรนด์ (Trend Planner)
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>วางแผนตารางโพสต์ล่วงหน้า 7 วัน โดยอิงจากกระแส ข่าวสารล่าสุดในวงการไอที และเทรนด์ไวรัล</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>อัปเดตข่าวสารอัตโนมัติ:</strong> ดึงข้อมูลข่าวสารล่าสุดจากสำนักข่าวไอที (RSS Feeds) และกวาดโพสต์ยอดฮิตจากเพจ Facebook ชั้นนำแบบเรียลไทม์</li>
                <li style={{ marginBottom: '12px' }}><strong>AI กรองข่าวสาร (AI Content Filtering):</strong> ใช้พลังจาก Gemini AI เพื่อคัดกรองเฉพาะ "เนื้อหาที่เกี่ยวกับสินค้าในร้าน" และวิเคราะห์ Engagement ว่าเป็น "ข่าวที่มีกระแสความสนใจสูงจริง" ทำให้ได้ข่าวเน้นๆ ไม่หลุดกรอบ</li>
                <li style={{ marginBottom: '12px' }}><strong>สร้างแผน 7 วันด้วย AI:</strong> ปัญญาประดิษฐ์จะออกแบบปฏิทินโพสต์ 7 วัน โดยคำนวณและจัดสัดส่วนทั้งโพสต์ขายของ (Sales), ข่าว (News), มุกตลก (Meme), และสร้างการมีส่วนร่วม (Engagement)</li>
                <li><strong>Export แผนงาน:</strong> ดาวน์โหลดตารางแผนงานทั้งหมดออกมาเป็นไฟล์ <code>.xlsx</code> (Excel) เพื่อส่งต่องานให้ทีมกราฟิกและทีมการตลาดได้อย่างง่ายดาย</li>
              </ul>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={300} className="double-bezel-outer">
            <div className="double-bezel-inner" style={{ padding: '32px', lineHeight: '1.7' }}>
              <h2 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginTop: '0', fontSize: '1.5rem' }}>
                🤖 3. หน้า สร้างคอนเทนต์ด้วย AI (AI Content Creator)
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>ผู้ช่วยอัจฉริยะในการคิดแคปชันและเขียนคำสั่ง (Prompt) เพื่อสั่ง AI วาดภาพ (เช่น Midjourney)</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>เทมเพลตพร้อมใช้:</strong> เลือกโครงสร้างการโพสต์ เช่น ป้ายโปรโมท Notebook, อุปกรณ์ Gaming, หรือรูปโปรโมตสินค้าล้างสต็อก</li>
                <li style={{ marginBottom: '12px' }}><strong>สร้างแคปชันและ Prompt:</strong> AI จะแต่งแคปชันภาษาไทยที่ดึงดูดสำหรับโซเชียลมีเดีย พร้อมแต่งคำสั่งภาษาอังกฤษ (Image Prompt) สำหรับให้โปรแกรมสร้างภาพวาด โดยคุมโทนสีของแบรนด์ให้ด้วย</li>
                <li><strong>คัดลอกใช้งานไว:</strong> กดคัดลอกข้อความทั้งหมดเพียงคลิกเดียว เพื่อนำไปใช้บนหน้าเพจเฟซบุ๊ก หรือโปรแกรมสร้างรูปได้ทันที</li>
              </ul>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={400} className="double-bezel-outer" style={{ borderColor: 'var(--color-accent)', background: 'linear-gradient(to right, rgba(235,235,245,0.02), rgba(235,235,245,0))' }}>
            <div className="double-bezel-inner" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem' }}>💡</div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>ทิปส์การใช้งานระบบอัตโนมัติ</h4>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                  ระบบจะบันทึกสถานะล่าสุดของคุณโดยอัตโนมัติ (Auto-Save) ทั้งราคาสินค้าที่ Scrap มาได้, ลิสต์รายการข่าวที่ดึงมา, และตารางงานที่เพิ่ง Generate เสร็จ หากคุณปิดเบราว์เซอร์ไป ข้อมูลก็จะยังคงอยู่เมื่อเปิดเข้ามาใหม่จนกว่าคุณจะกดอัปเดตหรือโหลดข้อมูลทับ
                </p>
              </div>
            </div>
          </FadeUpReveal>

        </section>
      </div>
    </main>
  );
}

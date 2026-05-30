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
          <Link href="/promotion-combo">Promotion Combo</Link>
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
              <p style={{ color: 'var(--color-text-secondary)' }}>เกาะกระแสโซเชียลและข่าวสารวงการไอที เพื่อสร้างคอนเทนต์ข่าวไวรัลได้แบบทันท่วงที</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>Auto Trend Radar:</strong> ดึงโพสต์ล่าสุดจาก 4 เพจไอทีชั้นนำ (Comcraft, NotebookSpec, Extreme IT, Overclockzone) คัดเฉพาะหัวข้อเด่นเพจละ 4 โพสต์</li>
                <li style={{ marginBottom: '12px' }}><strong>ข้อมูลสดใหม่เสมอ:</strong> ล้างข้อมูลเก่าทิ้งทุกครั้งที่เปิดหน้านี้ใหม่ เพื่อให้มั่นใจว่าคุณกำลังดูเฉพาะเทรนด์ปัจจุบัน</li>
                <li style={{ marginBottom: '12px' }}><strong>แปลงข่าวเป็นคอนเทนต์:</strong> กดเลือกข่าวที่น่าสนใจเพื่อให้ AI สรุปพาดหัวข่าวสั้นกระชับ พร้อมข้อความ Hook ดึงดูดสายตา</li>
                <li><strong>ดีไซน์ภาพข่าวระดับโปร:</strong> AI สร้าง Prompt วาดภาพประกอบข่าว (สำหรับ DALL-E 3) พร้อมกำหนด Layout การวางข้อความ 60/40 แบบเพจชั้นนำให้ทันที</li>
              </ul>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={300} className="double-bezel-outer">
            <div className="double-bezel-inner" style={{ padding: '32px', lineHeight: '1.7' }}>
              <h2 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginTop: '0', fontSize: '1.5rem' }}>
                🤖 3. หน้า สร้างคอนเทนต์ด้วย AI (AI Content Creator)
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>ผู้ช่วยอัจฉริยะในการคิดแคปชันและเขียนคำสั่ง (Prompt) เพื่อสั่ง AI วาดภาพ (เช่น ChatGPT Images)</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>เทมเพลตพร้อมใช้:</strong> มีรูปแบบให้เลือกเช่น ทิปส์ไอที, คำแนะนำก่อนซื้อ, โพสต์ขาย/โปรโมชัน, และพิมพ์คำสั่งเอง (Free-text)</li>
                <li style={{ marginBottom: '12px' }}><strong>รู้ใจชาวสามร้อยยอด:</strong> โหมด "โพสต์ขาย/โปรโมชัน" จะดึงคู่มือ `AgentPromotion` มาใช้ เพื่อเขียนแคปชันให้เข้าถึงคนในพื้นที่ (เช่น อ้างอิงพิกัดสาขาไร่ใหม่) และใช้ภาษาวัยรุ่นผสมมีม</li>
                <li><strong>คัดลอกใช้งานไว:</strong> กดปุ่มคัดลอกข้อความโครงสร้าง Prompt เพื่อนำไปเจเนอเรตภาพต่อได้เพียงคลิกเดียว</li>
              </ul>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={400} className="double-bezel-outer">
            <div className="double-bezel-inner" style={{ padding: '32px', lineHeight: '1.7' }}>
              <h2 style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginTop: '0', fontSize: '1.5rem' }}>
                🎁 4. หน้า Promotion Combo (โปรโมชันคอมโบ)
              </h2>
              <p style={{ color: 'var(--color-text-secondary)' }}>สร้างแคมเปญกระตุ้นยอดขายด้วยโปรโมชัน "ซื้อคู่ถูกกว่า" หรือการแลกซื้อสุดพิเศษ</p>
              <ul style={{ marginLeft: '24px', marginBottom: '0', color: 'var(--color-text-secondary)' }}>
                <li style={{ marginBottom: '12px' }}><strong>จับคู่สินค้าในสต็อก:</strong> เลือกสินค้าหลัก (Main Product) และสินค้ารอง (Secondary Product) จากหน้ารายการสินค้า</li>
                <li style={{ marginBottom: '12px' }}><strong>AI เขียนคำโปรย:</strong> AI จะสร้างข้อความโฆษณาที่ขยี้ปัญหา (Pain Point) เพื่อกระตุ้นให้ลูกค้าเห็นความคุ้มค่าของการซื้อคู่</li>
                <li><strong>ใช้งานร่วมกับ AI Content:</strong> สไตล์การเขียนถูกปรับจูนมาเพื่อลูกค้าท้องถิ่น (Localization) ให้มีความเป็นกันเอง ไม่เป็นทางการจนเกินไป</li>
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

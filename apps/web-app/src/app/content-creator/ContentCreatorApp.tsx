"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContentCreatorApp() {
  const [template, setTemplate] = useState("ทิปส์ไอที");
  const [imageLayout, setImageLayout] = useState("album5");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify({ template, prompt, imageLayout })
      });
      const data = await res.json();
      let finalResult = data.result || "เกิดข้อผิดพลาดในการสร้างคอนเทนต์";
      
      // Clean up markdown fences if present
      if (typeof finalResult === "string" && finalResult.startsWith("```json")) {
        finalResult = finalResult.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      }
      
      setResult(finalResult);
    } catch (e) {
      setResult("Error generating content");
    } finally {
      setLoading(false);
    }
  }

  function renderResult(res: string) {
    if (!res) return null;
    try {
      const parsed = JSON.parse(res);
      // Construct the full prompt text
      const promptText = `${parsed.intro}
หัวข้อ: ${parsed.topic}
Pain Point: ${parsed.painPoint}
Insight: ${parsed.insight}
Bridge Content:
- Meme: ${parsed.bridgeContent?.meme}
- Useful: ${parsed.bridgeContent?.useful}
- Product: ${parsed.bridgeContent?.product}
Hook: ${parsed.hook}
Meme Angle: ${parsed.memeAngle}
แตกคอนเทนต์: ${parsed.contentBreakdown}
Visual Direction: ${parsed.visualDirection}

${parsed.layout}

${parsed.imagePrompts ? `รายละเอียดภาพ (Image Prompts):\n${parsed.imagePrompts.join('\n')}` : ''}`;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            <p><strong>Pain Point:</strong> {parsed.painPoint}</p>
            <p><strong>Insight:</strong> {parsed.insight}</p>
            <p><strong>Visual Direction:</strong> {parsed.visualDirection}</p>
            {parsed.imagePrompts && (
              <div style={{ marginTop: "8px" }}>
                <strong>รูปแบบภาพ:</strong> {parsed.imagePrompts.length} ภาพ
              </div>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>โครงสร้าง Prompt ฉบับเต็ม:</p>
          <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "12px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}>
            {promptText}
          </pre>
          <button 
            className="secondaryButton" 
            onClick={() => {
              navigator.clipboard.writeText(promptText);
              alert("คัดลอก Prompt เรียบร้อยแล้ว!");
            }}
            style={{ alignSelf: "flex-start", marginTop: "8px" }}
          >
            📋 คัดลอก Prompt ไปเจนภาพ
          </button>
        </div>
      );
    } catch {
      return <p style={{ whiteSpace: "pre-wrap" }}>{res}</p>;
    }
  }

  return (
    <div className="appPage">
      <nav className="topNav">
        <Link href="/">แผนจากสต็อก</Link>
        <Link href="/trend-planner">แผนจากเทรนด์</Link>
        <Link href="/promotion-combo">Promotion Combo</Link>
        <Link className="activeNav" href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
        <Link href="/guide">คู่มือการใช้งาน</Link>
      </nav>
      <header className="appHero">
        <div>
          <h1>AI Content Creator</h1>
          <p className="intro">สร้างคอนเทนต์ด้วย AI ผ่าน Template แบบรวดเร็ว หรือพิมพ์สั่งอย่างอิสระ</p>
        </div>
      </header>
      <section className="gridTwo">
        <div className="panel stepPanel">
          <div className="fileInput">
            <label>รูปแบบคอนเทนต์</label>
            <select value={template} onChange={e => setTemplate(e.target.value)} className="trendBox">
              <option value="ทิปส์ไอที">ทิปส์ไอที / แก้ปัญหาคอม</option>
              <option value="เลือกซื้อสินค้า">คำแนะนำก่อนซื้อ (Buying Guide)</option>
              <option value="โปรโมชัน">โพสต์ขาย/โปรโมชัน</option>
              <option value="free-text">พิมพ์คำสั่งเอง (Free-text)</option>
            </select>
          </div>

          {template === "ทิปส์ไอที" && (
            <div className="fileInput">
              <label>รูปแบบภาพ (Image Layout)</label>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal' }}>
                  <input type="radio" name="imageLayout" value="album5" checked={imageLayout === "album5"} onChange={e => setImageLayout(e.target.value)} />
                  อัลบั้ม 5 ภาพ (2 บน, 3 ล่าง)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'normal' }}>
                  <input type="radio" name="imageLayout" value="single" checked={imageLayout === "single"} onChange={e => setImageLayout(e.target.value)} />
                  ภาพเดี่ยว (Single Image)
                </label>
              </div>
            </div>
          )}

          <div className="fileInput">
            <label>{template === "free-text" ? "คำสั่งสำหรับ AI (Prompt)" : "หัวข้อ / สินค้า (เช่น 'วิธีเลือกเมาส์เกมมิ่ง' หรือ 'Notebook Acer')"}</label>
            {template === "free-text" ? (
              <textarea 
                value={prompt} 
                onChange={e => setPrompt(e.target.value)} 
                className="trendBox"
                placeholder='เช่น "ช่วยเขียนโพสต์แนะนำวิธีเลือกซื้อการ์ดจอสำหรับงบ 10,000 บาทหน่อย"'
                rows={5}
              />
            ) : (
              <input value={prompt} onChange={e => setPrompt(e.target.value)} />
            )}
          </div>
          <button className="primaryButton" onClick={handleGenerate} disabled={loading || !prompt}>
            {loading ? "กำลังร่างคอนเทนต์..." : "ร่างคอนเทนต์ด้วย Gemini"}
          </button>
        </div>
        <div className="panel stepPanel">
          <div className="sectionHeader"><h2>ผลลัพธ์จาก AI</h2></div>
          {result && (
            <div className="assetBox">
              {renderResult(result)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { HistoryDrawer } from "../../components/history/HistoryDrawer";

export default function ContentCreatorApp() {
  const [template, setTemplate] = useState("ทิปส์ไอที");
  const [imageLayout, setImageLayout] = useState("album5");
  const [prompt, setPrompt] = useState("");
  const [videoTopic, setVideoTopic] = useState("");
  const [videoBrief, setVideoBrief] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Restore history event listener
  useEffect(() => {
    const handleRestore = (e: Event) => {
      const item = (e as CustomEvent).detail;
      if (item.pageType === "creator") {
        const state = item.inputState;
        if (state) {
          if (state.template) setTemplate(state.template);
          if (state.prompt !== undefined) setPrompt(state.prompt);
          if (state.imageLayout !== undefined) setImageLayout(state.imageLayout);
          if (state.videoTopic !== undefined) setVideoTopic(state.videoTopic);
          if (state.videoBrief !== undefined) setVideoBrief(state.videoBrief);
          setResult(item.result);
        }
      }
    };
    window.addEventListener("restore-campaign", handleRestore);
    return () => window.removeEventListener("restore-campaign", handleRestore);
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify({ 
          template, 
          prompt: template === "video-thumbnail" ? "" : prompt, 
          imageLayout,
          videoTopic: template === "video-thumbnail" ? videoTopic : undefined,
          videoBrief: template === "video-thumbnail" ? videoBrief : undefined
        })
      });
      const data = await res.json();
      let finalResult = data.result || "เกิดข้อผิดพลาดในการสร้างคอนเทนต์";
      
      // Clean up markdown fences if present
      if (typeof finalResult === "string" && finalResult.startsWith("```json")) {
        finalResult = finalResult.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      }
      
      setResult(finalResult);
      if (data.result) {
        import("../../utils/historyUtils").then(({ saveToHistory }) => {
          saveToHistory({
            pageType: "creator",
            title: `แผนคอนเทนต์: ${template === "video-thumbnail" ? videoTopic : prompt}`,
            result: finalResult,
            inputState: { template, prompt, imageLayout, videoTopic, videoBrief }
          });
        });
      }
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
      let promptText = "";
      let uiDisplay = null;

      if (template === "video-thumbnail") {
        promptText = `${parsed.intro}
หัวข้อ: ${parsed.topic}
${parsed.subTopic ? `สโลแกน: ${parsed.subTopic}\n` : ''}${parsed.productName ? `ชื่อสินค้า: ${parsed.productName}\n` : ''}${parsed.presenter ? `พรีเซนเตอร์: ${parsed.presenter}\n` : ''}${parsed.features ? `จุดเด่น: ${parsed.features}\n` : ''}${parsed.mainFeatures ? `ฟีเจอร์หลัก: ${parsed.mainFeatures}\n` : ''}${parsed.memeAngle ? `Meme Angle: ${parsed.memeAngle}\n` : ''}${parsed.priceTag ? `ราคา: ${parsed.priceTag}\n` : ''}${parsed.productShowcase ? `รุ่นต่างๆ:\n- ${parsed.productShowcase.join('\n- ')}\n` : ''}
Visual Direction: ${parsed.visualDirection}

${parsed.layout}

รายละเอียดภาพ (Image Prompts):
${parsed.imagePrompts ? parsed.imagePrompts.join('\n') : ''}

บังคับให้ใส่ข้อความต่อไปนี้ประกอบลงในด้านล่างสุดของภาพด้วย:
[ไอคอน Line] @a0917611968
[ไอคอนโทรศัพท์] 091-7611968
มีบริการ รับ-ส่ง สินค้าและเครื่องซ่อม`;

        uiDisplay = (
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            <p><strong>แบบ:</strong> ภาพปกคลิป 6:9</p>
            {parsed.presenter && <p><strong>พรีเซนเตอร์:</strong> {parsed.presenter}</p>}
            {parsed.visualDirection && <p><strong>Visual Direction:</strong> {parsed.visualDirection}</p>}
          </div>
        );
      } else if (parsed.promotion) {
        // โปรโมชัน template
        promptText = `${parsed.intro}
หัวข้อ: ${parsed.topic}
Hook: ${parsed.hook}
ขยี้ปัญหา/เทรนด์: ${parsed.contextAndTrend}
โปรโมชัน: ${parsed.promotion}
Call to Action: ${parsed.cta}
Visual Direction: ${parsed.visualDirection || ''}

${parsed.layout || ''}

${parsed.imagePrompts ? `รายละเอียดภาพ (Image Prompts):\n${parsed.imagePrompts.join('\n')}` : ''}`;
        
        uiDisplay = (
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            <p><strong>Hook:</strong> {parsed.hook}</p>
            <p><strong>โปรโมชัน:</strong> {parsed.promotion}</p>
            <p><strong>Visual Direction:</strong> {parsed.visualDirection}</p>
            {parsed.imagePrompts && (
              <div style={{ marginTop: "8px" }}>
                <strong>รูปแบบภาพ:</strong> {parsed.imagePrompts.length} ภาพ
              </div>
            )}
          </div>
        );
      } else {
        // ทิปส์ไอที template
        promptText = `${parsed.intro}
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
        
        uiDisplay = (
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
        );
      }

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {uiDisplay}
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>โครงสร้าง Prompt ฉบับเต็ม:</p>
          <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "rgba(2,4,10,0.8)", border: "1px solid var(--color-glass-border)", color: "#fafaf9", padding: "12px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}>
            {promptText}
          </pre>
          <button 
            className="primaryButton" 
            onClick={() => {
              navigator.clipboard.writeText(promptText);
              alert("คัดลอก Prompt เรียบร้อยแล้ว!");
            }}
            style={{ alignSelf: "flex-start", marginTop: "8px", width: "auto" }}
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
    <main className="appShell">
      <div className="appPage">
        <nav className="topNav" aria-label="เมนูหลัก">
          <div className="navBranding" style={{ display: 'flex', alignItems: 'center', marginRight: '24px', fontWeight: 900, fontSize: '1.2rem', color: '#fafaf9' }}>
            <span style={{ color: '#22d3ee', textShadow: '0 0 10px #22d3ee' }}>Advice</span>
            <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: '#facc15', border: '1px solid #facc15', padding: '2px 4px', borderRadius: '4px' }}>สามร้อยยอด</span>
          </div>
          <Link href="/">แผนจากสต็อก</Link>
          <Link href="/trend-planner">แผนจากเทรนด์</Link>
          <Link href="/promotion-combo">Promotion Combo</Link>
          <Link className="activeNav" href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link href="/guide">คู่มือการใช้งาน</Link>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-neon-cyan)',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: '800',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.3s'
            }}
            title="เปิดคลังประวัติแคมเปญ"
          >
            🕒 ประวัติ
          </button>
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
                <option value="video-thumbnail">ภาพปกคลิป (Video Thumbnail)</option>
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

            {template === "video-thumbnail" ? (
              <>
                <div className="fileInput">
                  <label>หัวข้อของคอนเทนต์คลิป <span style={{ color: "#ef4444" }}>*</span></label>
                  <input 
                    type="text" 
                    value={videoTopic} 
                    onChange={e => setVideoTopic(e.target.value)} 
                    className="trendBox"
                    placeholder="เช่น แนะนำ 5 ฟีเจอร์ลับ Windows 11 ที่ทุกคนต้องรู้"
                  />
                </div>
                <div className="fileInput">
                  <label>บรีฟที่อยากได้ในภาพ</label>
                  <textarea 
                    value={videoBrief} 
                    onChange={e => setVideoBrief(e.target.value)} 
                    className="trendBox"
                    rows={3}
                    placeholder="ระบุสไตล์ องค์ประกอบ หรือฉากหลัง เช่น พรีเซนเตอร์ผู้หญิงยืนทำหน้าตื่นเต้น มีแท่นวางโน้ตบุ๊กเรืองแสง โทนสีม่วง/ส้ม"
                  />
                </div>
              </>
            ) : (
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
                  <input value={prompt} onChange={e => setPrompt(e.target.value)} className="trendBox" />
                )}
              </div>
            )}
            <button 
              className="primaryButton" 
              onClick={handleGenerate} 
              disabled={loading || (template === "video-thumbnail" ? !videoTopic : !prompt)}
            >
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
        <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      </div>
    </main>
  );
}

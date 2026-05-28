import React, { useState } from "react";
import { PanelTitle } from "./PanelTitle";
import { Skeleton } from "../ui/Skeleton";
import { useGenerateContentMutation } from "../../hooks/queries/useAIMutation";

import { useUIStore } from "../../store/uiStore";

export function StockContentCreator() {
  const template = useUIStore(state => state.aiTemplate);
  const setAITemplate = useUIStore(state => state.setAITemplate);
  const prompt = useUIStore(state => state.aiPrompt);
  const setAIPrompt = useUIStore(state => state.setAIPrompt);
  const freeGift = useUIStore(state => state.aiFreeGift);
  const setAIFreeGift = useUIStore(state => state.setAIFreeGift);
  const [copied, setCopied] = useState(false);
  const generateMutation = useGenerateContentMutation();

  function handleGenerateContent() {
    generateMutation.mutate({ template, prompt, freeGift });
  }

  const loadingContent = generateMutation.isPending;
  let result = "";
  if (generateMutation.data?.result) {
    result = generateMutation.data.result;
    if (typeof result === "string" && result.startsWith("```json")) {
      result = result.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }
  }

  function renderResult(res: string) {
    if (!res) return null;
    try {
      const parsed = JSON.parse(res);
      const promptText = `${parsed.intro}
หัวข้อ: ${parsed.topic}
${parsed.subTopic ? `สโลแกน: ${parsed.subTopic}\n` : ''}${parsed.productName ? `ชื่อสินค้า: ${parsed.productName}\n` : ''}${parsed.features ? `จุดเด่น: ${parsed.features}\n` : ''}${parsed.priceTag ? `ราคา: ${parsed.priceTag}\n` : ''}${parsed.productShowcase ? `รุ่นต่างๆ:\n- ${parsed.productShowcase.join('\n- ')}\n` : ''}
Visual Direction: ${parsed.visualDirection}

${parsed.layout}

รายละเอียดภาพ (Image Prompts):
${parsed.imagePrompts ? parsed.imagePrompts.join('\n') : ''}`;

      // Badge Logic Fix: rely on 'template' state instead of JSON keys
      let badgeLabel = "";
      if (template === "product-a-notebook") badgeLabel = "โปสเตอร์ Notebook 3 รุ่น";
      else if (template === "product-a-chair") badgeLabel = "โปสเตอร์เก้าอี้ Before/After";
      else if (template === "product-a-gaming") badgeLabel = "โปสเตอร์ Gaming สายสเปค";
      else if (template === "product-a-printer") badgeLabel = "โปสเตอร์ Printer แจกของแถม";
      else if (template === "product-a-speaker") badgeLabel = "โปสเตอร์ Speaker แต่งโต๊ะคอม";
      else if (template === "stock-product-b") badgeLabel = "โปสเตอร์ภาพเดี่ยว Clearance";

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            {badgeLabel && <p><strong>แบบ:</strong> {badgeLabel}</p>}
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>โครงสร้าง Prompt ฉบับเต็ม:</p>
          <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "12px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}>
            {promptText}
          </pre>
          <button 
            className="secondaryButton" 
            onClick={() => {
              navigator.clipboard.writeText(promptText);
              setCopied(true);
              import("react-hot-toast").then(({ toast }) => toast.success("คัดลอก Prompt สำเร็จ!"));
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ alignSelf: "flex-start", marginTop: "8px", borderColor: copied ? "#86efac" : undefined, color: copied ? "#86efac" : undefined }}
          >
            {copied ? "✅ คัดลอกสำเร็จ!" : "📋 คัดลอก Prompt ไปเจนภาพ"}
          </button>
        </div>
      );
    } catch {
      return <p style={{ whiteSpace: "pre-wrap" }}>{res}</p>;
    }
  }

  return (
    <section className="gridTwo" style={{ marginTop: '24px' }}>
      <div className="panel stepPanel">
        <PanelTitle
          step="ขั้นตอนที่ 2-3"
          title="AI Content Creator"
          description="เลือกประเภทโปสเตอร์และร่าง Prompt สำหรับ DALL-E 3"
        />
        <div className="fileInput">
          <label>รูปแบบคอนเทนต์</label>
          <select value={template} onChange={e => setAITemplate(e.target.value)} className="trendBox">
            <optgroup label="Product A (สินค้ามูลค่าสูง / พรีเมียม)">
              <option value="product-a-notebook">Notebook (โปสเตอร์ 3 ส่วนโชว์สเปค/ของแถม)</option>
              <option value="product-a-chair">เก้าอี้ (แก้ปวดหลัง / Before vs After)</option>
              <option value="product-a-gaming">Gaming Gear (สายเกมมิ่ง โชว์ฟีเจอร์จัดเต็ม)</option>
              <option value="product-a-printer">Printer (เน้นประหยัดคุ้มค่า / ของแถมชิ้นใหญ่)</option>
              <option value="product-a-speaker">Speaker (แต่งโต๊ะคอม / มินิมอล Lifestyle)</option>
            </optgroup>
            <optgroup label="Product B (สินค้าทั่วไป / ลดราคา)">
              <option value="stock-product-b">Product B (โปสเตอร์ภาพเดี่ยว Clearance)</option>
            </optgroup>
          </select>
        </div>
        <div className="fileInput">
          <label>ข้อมูลสินค้า (กด "✨ สร้างคอนเทนต์" จากตารางด้านบน)</label>
          <textarea 
            value={prompt} 
            onChange={e => setAIPrompt(e.target.value)} 
            className="trendBox"
            rows={3}
            placeholder="เลือกสินค้าจากตารางเพื่อดึงข้อมูลมาไว้ที่นี่..."
          />
        </div>
        {template === "product-a-notebook" && (
          <div className="fileInput">
            <label>ของแถม (ชื่อและมูลค่า)</label>
            <input 
              type="text" 
              value={freeGift} 
              onChange={e => setAIFreeGift(e.target.value)} 
              className="trendBox"
              placeholder="เช่น กระเป๋าเป้และเมาส์ไร้สาย มูลค่า 1,290 บาท"
            />
          </div>
        )}
        <button className="primaryButton" onClick={handleGenerateContent} disabled={loadingContent || !prompt}>
          {loadingContent ? "กำลังร่าง Prompt..." : "ร่าง Prompt ด้วย Gemini"}
        </button>
      </div>

      <div className="panel stepPanel">
        <div className="sectionHeader"><h2>ผลลัพธ์จาก AI</h2></div>
        {loadingContent ? (
          <div className="assetBox" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Skeleton style={{ height: "400px" }} />
          </div>
        ) : result ? (
          <div className="assetBox">
            {renderResult(result)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

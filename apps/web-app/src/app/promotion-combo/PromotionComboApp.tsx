"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { StockTablePanel } from "../../components/planner/StockTablePanel";
import { PanelTitle } from "../../components/planner/PanelTitle";
import { FadeUpReveal } from "../../components/ui/FadeUpReveal";
import { StatusBox } from "../../components/trend-planner/StatusBox";
import { useInventoryQuery } from "../../hooks/queries/useInventoryQuery";
import type { PlannerState, InventoryItem } from "../../types/planner";
import toast from "react-hot-toast";

const numberFormatter = new Intl.NumberFormat("th-TH");
const moneyFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });

export default function PromotionComboApp({ initialState }: { initialState: PlannerState }) {
  const queryClient = useQueryClient();
  const { state, syncStockMutation } = useInventoryQuery(initialState);
  
  const [productA, setProductA] = useState<InventoryItem | null>(null);
  const [productB, setProductB] = useState<InventoryItem | null>(null);
  const [promoPriceB, setPromoPriceB] = useState<string>("");
  
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const handleSearchPrice = async (code: string) => {
    const toastId = toast.loading("กำลังดึงราคาจาก Advice...");
    try {
      const res = await fetch("/api/scrape-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาดในการดึงราคา");
      
      queryClient.setQueryData(["plannerState"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          inventory: old.inventory.map((item: any) => 
            item.code === code ? { ...item, sellPrice: data.price } : item
          )
        };
      });

      toast.success(`ดึงราคาสำเร็จ: ${numberFormatter.format(data.price)} บาท`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleGenerateAI = async () => {
    if (!productA || !productB) {
      toast.error("กรุณาเลือกสินค้าหลักและสินค้ารอง");
      return;
    }
    if (!promoPriceB) {
      toast.error("กรุณาระบุราคาพิเศษของสินค้ารองเมื่อซื้อคู่กัน");
      return;
    }

    setGeneratingAI(true);
    setAiResult("");
    
    setTimeout(() => {
      document.getElementById('ai-result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    const promptText = `สินค้าหลัก (Product A): ${productA.product} (ราคา ${productA.sellPrice || productA.cost} บาท)
สินค้ารอง (Product B): ${productB.product} (ราคาปกติ ${productB.sellPrice || productB.cost} บาท)
ราคาพิเศษเมื่อซื้อคู่กัน (Product B Promo Price): ${promoPriceB} บาท`;

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify({ 
          template: "promotion-combo", 
          prompt: promptText
        })
      });
      const data = await res.json();
      let finalResult = data.result || "เกิดข้อผิดพลาดในการสร้างคอนเทนต์";
      
      if (typeof finalResult === "string" && finalResult.startsWith("```json")) {
        finalResult = finalResult.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      }
      
      setAiResult(finalResult);
    } catch (e) {
      setAiResult("Error generating content");
    } finally {
      setGeneratingAI(false);
    }
  };

  function renderResult(res: string) {
    if (!res) return null;
    try {
      const parsed = JSON.parse(res);
      const promptText = `${parsed.intro}
หัวข้อ: ${parsed.topic}
Hook (ไวรัล/มีม): ${parsed.hook}
ขยี้ปัญหา/เทรนด์: ${parsed.contextAndTrend}
โปรโมชั่นกระแทกใจ: ${parsed.promotion}
Call to Action: ${parsed.cta}`;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            <p><strong>Hook:</strong> {parsed.hook}</p>
            <p><strong>โปรโมชั่น:</strong> {parsed.promotion}</p>
            <p><strong>Call to Action:</strong> {parsed.cta}</p>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>โครงสร้างฉบับเต็ม:</p>
          <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "#1e1e1e", color: "#d4d4d4", padding: "12px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}>
            {promptText}
          </pre>
          <button 
            className="secondaryButton" 
            onClick={() => {
              navigator.clipboard.writeText(promptText);
              toast.success("คัดลอกข้อความเรียบร้อยแล้ว!");
            }}
            style={{ alignSelf: "flex-start", marginTop: "8px" }}
          >
            📋 คัดลอกข้อความไปโพสต์
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
          <Link href="/">แผนจากสต็อก</Link>
          <Link href="/trend-planner">แผนจากเทรนด์</Link>
          <Link className="activeNav" href="/promotion-combo">Promotion Combo</Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link href="/guide">คู่มือการใช้งาน</Link>
        </nav>

        <header className="appHero">
          <div>
            <p className="eyebrow">Sale Campaign Planner</p>
            <h1>Promotion Combo สร้างโปรโมชั่นซื้อคู่สุดคุ้ม</h1>
            <p className="intro">
              เลือกสินค้าหลัก 1 ชิ้น และสินค้ารอง 1 ชิ้น เพื่อจัดแคมเปญแลกซื้อ พร้อมให้ AI ร่างคอนเทนต์ดึงดูดใจตามสไตล์ AgentPromotion
            </p>
          </div>
          <StatusBox action={{ 
            loading: syncStockMutation.isPending, 
            message: syncStockMutation.isPending ? "กำลังทำงาน..." : "พร้อมใช้งาน", 
            error: syncStockMutation.error?.message || "" 
          }} />
        </header>

        <section className="gridTwo" style={{ marginBottom: '24px' }}>
          <div className="panel stepPanel">
            <PanelTitle step="สินค้าหลัก" title="เลือกสินค้า 1 (Product A)" description="สินค้าหลักที่ลูกค้าจะซื้อ" />
            <div className="assetBox" style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {productA ? (
                <>
                  <strong>{productA.product}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>รหัส: {productA.code} | ราคาปกติ: {productA.sellPrice ? moneyFormatter.format(productA.sellPrice) : "-"}</span>
                  <button className="secondaryButton compactButton" onClick={() => setProductA(null)} style={{ marginTop: '12px', alignSelf: 'flex-start' }}>ยกเลิก</button>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>ยังไม่ได้เลือกสินค้าหลัก (คลิกปุ่มจากตารางด้านล่าง)</span>
              )}
            </div>
          </div>
          
          <div className="panel stepPanel">
            <PanelTitle step="สินค้ารอง" title="เลือกสินค้า 2 (Product B)" description="สินค้าแลกซื้อราคาพิเศษเมื่อซื้อคู่กับ Product A" />
            <div className="assetBox" style={{ minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {productB ? (
                <>
                  <strong>{productB.product}</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>รหัส: {productB.code} | ราคาปกติ: {productB.sellPrice ? moneyFormatter.format(productB.sellPrice) : "-"}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                    <label style={{ fontSize: '0.85rem' }}>ราคาพิเศษซื้อคู่:</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 1,990" 
                      value={promoPriceB} 
                      onChange={e => setPromoPriceB(e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #44403c', background: '#1c1917', color: '#fff', width: '120px' }}
                    />
                    <span style={{ fontSize: '0.85rem' }}>บาท</span>
                  </div>
                  <button className="secondaryButton compactButton" onClick={() => setProductB(null)} style={{ marginTop: '12px', alignSelf: 'flex-start' }}>ยกเลิก</button>
                </>
              ) : (
                <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>ยังไม่ได้เลือกสินค้ารอง (คลิกปุ่มจากตารางด้านล่าง)</span>
              )}
            </div>
          </div>
        </section>

        {(productA && productB) && (
          <FadeUpReveal delay={100} style={{ marginBottom: '24px' }}>
            <button className="primaryButton" onClick={handleGenerateAI} disabled={generatingAI} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
              {generatingAI ? "กำลังวิเคราะห์โปรโมชั่น..." : "✨ ให้ AI สรุปเป็นคอนเทนต์โปรโมชั่น Combo"}
            </button>
          </FadeUpReveal>
        )}

        {generatingAI || aiResult ? (
          <FadeUpReveal delay={200} className="double-bezel-outer" style={{ marginBottom: '24px' }}>
            <div className="double-bezel-inner" id="ai-result-section">
              <PanelTitle
                step="ผลลัพธ์จาก AI"
                title="คอนเทนต์โปรโมชั่น Combo Set"
                description="อ้างอิงเทรนด์ไอทีและบริบทร้าน Advice สาขาสามร้อยยอด ตามคู่มือ AgentPromotion"
              />
              <div className="assetBox" style={{ marginTop: '16px' }}>
                {generatingAI ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    ⏳ AI กำลังร่างโพสต์และใส่ Hook เด็ดๆ...
                  </div>
                ) : (
                  renderResult(aiResult)
                )}
              </div>
            </div>
          </FadeUpReveal>
        ) : null}

        <StockTablePanel 
          inventory={state.inventory} 
          onSearchPrice={handleSearchPrice} 
          loading={syncStockMutation.isPending}
          renderCustomAction={(item) => (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="island-button" 
                onClick={() => setProductA(item)} 
                disabled={syncStockMutation.isPending} 
                style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '24px', background: '#3b82f6', color: '#fff', border: 'none' }}
              >
                เลือก A
              </button>
              <button 
                className="island-button" 
                onClick={() => setProductB(item)} 
                disabled={syncStockMutation.isPending} 
                style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '24px', background: '#10b981', color: '#fff', border: 'none' }}
              >
                เลือก B
              </button>
            </div>
          )}
        />
        
      </div>
    </main>
  );
}

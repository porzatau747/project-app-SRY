"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { TrendContentPlan, TrendSnapshotItem } from "../../types/planner";
import { StatusBox } from "../../components/trend-planner/StatusBox";
import { NewsAndTipsList } from "../../components/trend-planner/NewsAndTipsList";
import { PanelTitle } from "../../components/trend-planner/PanelTitle";
import { TrendRadarList } from "../../components/trend-planner/TrendRadarList";
import { FadeUpReveal } from "../../components/ui/FadeUpReveal";
import toast from "react-hot-toast";
import { HistoryDrawer } from "../../components/history/HistoryDrawer";

export default function TrendPlannerApp({ initialPlan }: { initialPlan: TrendContentPlan }) {
  const [snapshotItems, setSnapshotItems] = useState<TrendSnapshotItem[]>(initialPlan.trendSnapshot.items || []);
  const [fetchedAt, setFetchedAt] = useState<string | null>(initialPlan.trendSnapshot.fetchedAt || null);
  const [loading, setLoading] = useState(false);
  
  const [selectedNews, setSelectedNews] = useState<TrendSnapshotItem | null>(null);
  const [aiResult, setAiResult] = useState<string>("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Restore history event listener
  useEffect(() => {
    const handleRestore = (e: Event) => {
      const item = (e as CustomEvent).detail;
      if (item.pageType === "trend") {
        const state = item.inputState;
        if (state) {
          setSelectedNews(state);
          setAiResult(item.result);
        }
      }
    };
    window.addEventListener("restore-campaign", handleRestore);
    return () => window.removeEventListener("restore-campaign", handleRestore);
  }, []);

  const handleUpdateTrends = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/update-trends", { method: "POST", cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "อัปเดตข้อมูลไม่สำเร็จ");
      if (data.snapshot?.items) {
        setSnapshotItems(data.snapshot.items);
        setFetchedAt(data.snapshot.fetchedAt);
      }
      toast.success(`อัปเดตข้อมูลล่าสุดสำเร็จ (${data.count} โพสต์)`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async (item: TrendSnapshotItem) => {
    setSelectedNews(item);
    setGeneratingAI(true);
    setAiResult("");
    
    // Scroll down to result section smoothly
    setTimeout(() => {
      document.getElementById('ai-result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        body: JSON.stringify({ 
          template: "trend-news", 
          prompt: `${item.label}\n\n${item.summary}\n\nที่มา: ${item.source}`
        })
      });
      const data = await res.json();
      let finalResult = data.result || "เกิดข้อผิดพลาดในการสร้างคอนเทนต์";
      
      if (typeof finalResult === "string" && finalResult.startsWith("```json")) {
        finalResult = finalResult.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      }
      
      setAiResult(finalResult);
      if (data.result) {
        import("../../utils/historyUtils").then(({ saveToHistory }) => {
          saveToHistory({
            pageType: "trend",
            title: `แผนเทรนด์: ${item.label}`,
            result: finalResult,
            inputState: item
          });
        });
      }
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
Hook: ${parsed.hook}
Insight: ${parsed.insight}
Bridge Content:
- Product: ${parsed.bridgeContent?.product}
Visual Direction: ${parsed.visualDirection}

${parsed.layout ? `Layout: ${parsed.layout}\n` : ''}
${parsed.imagePrompts ? `รายละเอียดภาพ:\n${parsed.imagePrompts.join('\n')}` : ''}`;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ backgroundColor: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
            <p><strong>หัวข้อ:</strong> {parsed.topic}</p>
            <p><strong>Hook:</strong> {parsed.hook}</p>
            <p><strong>Insight:</strong> {parsed.insight}</p>
          </div>
          <p style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>โครงสร้างฉบับเต็ม:</p>
          <pre style={{ whiteSpace: "pre-wrap", backgroundColor: "rgba(2,4,10,0.8)", border: "1px solid var(--color-glass-border)", color: "#fafaf9", padding: "12px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit" }}>
            {promptText}
          </pre>
          <button 
            className="primaryButton" 
            onClick={() => {
              navigator.clipboard.writeText(promptText);
              toast.success("คัดลอกข้อความเรียบร้อยแล้ว!");
            }}
            style={{ alignSelf: "flex-start", marginTop: "8px", width: "auto" }}
          >
            📋 คัดลอกไปทำภาพ/โพสต์
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
          <Link className="activeNav" href="/trend-planner">แผนจากเทรนด์</Link>
          <Link href="/promotion-combo">Promotion Combo</Link>
          <Link href="/promotions">Promotion Bulk</Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
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
            <p className="eyebrow">Techtainment Page Planner</p>
            <h1>สแกนข่าว IT ใหญ่และเทรนด์ไวรัลไทย</h1>
            <p className="intro">
              กดอัปเดตข่าวสาร IT จากเพจหรือเว็บข่าว แล้วเลือกข่าวที่น่าสนใจเพื่อสร้างโพสต์ด้วย AI ทันที
            </p>
          </div>
          <StatusBox action={{ 
            loading, 
            message: loading ? "กำลังดำเนินการ..." : "พร้อมใช้งาน", 
            error: "" 
          }} />
        </header>

        <section className="bento-grid">
          <FadeUpReveal delay={100} className="double-bezel-outer" style={{ gridColumn: 'span 7' }}>
            <div className="double-bezel-inner">
              <PanelTitle
                step="Auto Trend Radar"
                title="หัวข้อข่าวไวรัลที่ AI ใช้จับกระแส"
                description="จัดหมวดหมู่ AI, Windows / PC Pain, RTX / PCGaming, Notebook, Office Productivity และ Security / Smart Device"
              />
            <TrendRadarList 
              items={snapshotItems} 
              fetchedAt={fetchedAt || ""} 
              generatedFrom="web" 
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="island-button" 
                  onClick={handleUpdateTrends} 
                  disabled={loading}
                >
                  {loading ? "กำลังดึงข้อมูล..." : "ดึงโพสต์ล่าสุดเพจคู่แข่ง"}
                </button>
                {fetchedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    ดึงข้อมูลล่าสุด: {new Date(fetchedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
            </div>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={200} style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 5' }}>
            <NewsAndTipsList 
              items={snapshotItems} 
              onAdd={handleGenerateAI} 
              loading={generatingAI} 
            />
          </FadeUpReveal>
        </section>

        {(selectedNews || generatingAI) && (
          <FadeUpReveal delay={300} className="double-bezel-outer" style={{ marginTop: '24px' }}>
            <div className="double-bezel-inner" id="ai-result-section">
            <PanelTitle
              step="ผลลัพธ์จาก AI"
              title={selectedNews?.label || "กำลังสร้างคอนเทนต์..."}
              description={generatingAI ? "AI กำลังวิเคราะห์และสรุปข่าวเพื่อสร้างพาดหัวและ Hook ให้น่าสนใจ..." : "สรุปข่าวสั้นกระชับ อ่านจบปุ๊บรู้เรื่องปั๊บ พร้อม Hook ดึงดูด"}
            />
            
            <div className="assetBox" style={{ marginTop: '16px' }}>
              {generatingAI ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  ⏳ กำลังประมวลผลคอนเทนต์...
                </div>
              ) : (
                renderResult(aiResult)
              )}
            </div>
            </div>
          </FadeUpReveal>
        )}
        <HistoryDrawer isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      </div>
    </main>
  );
}

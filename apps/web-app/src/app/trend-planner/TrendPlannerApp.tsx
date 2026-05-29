"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { TrendContentPlan } from "../../types/planner";
import { useTrendQuery } from "../../hooks/queries/useTrendQuery";
import { useUIStore } from "../../store/uiStore";
import { TabSwitcher } from "../../components/trend-planner/TabSwitcher";
import { StatusBox } from "../../components/trend-planner/StatusBox";
import { NewsAndTipsList } from "../../components/trend-planner/NewsAndTipsList";
import { PanelTitle } from "../../components/trend-planner/PanelTitle";
import { TrendRadarList } from "../../components/trend-planner/TrendRadarList";
import { TopPostCard } from "../../components/trend-planner/TopPostCard";
import { TrendPostCard } from "../../components/trend-planner/TrendPostCard";
import { FadeUpReveal } from "../../components/ui/FadeUpReveal";

export default function TrendPlannerApp({ initialPlan }: { initialPlan: TrendContentPlan }) {
  const { plan, updateDataMutation, generatePlanMutation, addNewsToPlan } = useTrendQuery(initialPlan);
  const { activeTrendTab: activeTab, setActiveTrendTab: setActiveTab } = useUIStore();
  
  const topPosts = useMemo(
    () => [...plan.weeklyPosts].sort((a, b) => b.viralScore - a.viralScore).slice(0, 3),
    [plan.weeklyPosts]
  );
  const loading = updateDataMutation.isPending || generatePlanMutation.isPending;
  const isUpdating = updateDataMutation.isPending;

  return (
    <main className="appShell">
      <div className="appPage">
        <nav className="topNav" aria-label="เมนูหลัก">
          <Link href="/">แผนจากสต็อก</Link>
          <Link className="activeNav" href="/trend-planner">
            แผนจากเทรนด์
          </Link>
          <Link href="/content-creator">สร้างคอนเทนต์ด้วย AI</Link>
          <Link href="/guide">คู่มือการใช้งาน</Link>
        </nav>

        <header className="appHero">
          <div>
            <p className="eyebrow">Techtainment Page Planner</p>
            <h1>สร้างตารางโพสต์ 7 วันจากข่าว IT ใหญ่และมีมไวรัลไทย</h1>
            <p className="intro">
              เมื่อกด Generate แผนเทรนด์ 7 วัน ระบบจะให้น้ำหนักข่าว IT จากประเทศไทยประมาณ 80% และต่างประเทศ 20% แล้วคัดเฉพาะข่าวใหญ่หรือข่าวที่มีสัญญาณคนสนใจสูง
            </p>
          </div>
          <StatusBox action={{ 
            loading, 
            message: loading ? "กำลังดำเนินการ..." : "พร้อมใช้งาน", 
            error: updateDataMutation.error?.message || generatePlanMutation.error?.message || "" 
          }} />
        </header>

        <section className="bento-grid">
          <FadeUpReveal delay={100} className="double-bezel-outer" style={{ gridColumn: 'span 8' }}>
            <div className="double-bezel-inner">
              <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
              <PanelTitle
                step="Auto Trend Radar"
                title={activeTab === 'news' ? "หัวข้อข่าวไวรัลที่ AI ใช้จับกระแส" : "ทิปส์ไอทีที่กำลังเป็นที่สนใจ"}
                description={activeTab === 'news' ? "จัดหมวด AI, Windows / PC Pain, RTX / PCGaming, Notebook, Office Productivity และ Security / Smart Device" : "คัดเน้นเฉพาะเนื้อหาที่สัมพันธ์กับสินค้าในร้าน"}
              />
            <TrendRadarList 
              items={plan.trendSnapshot.items.filter(item => activeTab === 'news' ? item.type !== 'tip' : item.type === 'tip')} 
              fetchedAt={plan.trendSnapshot.fetchedAt} 
              generatedFrom={plan.trendSnapshot.generatedFrom} 
            />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="island-button" 
                  onClick={() => updateDataMutation.mutate()} 
                  disabled={loading}
                >
                  {isUpdating ? "กำลังดึงข้อมูล..." : (activeTab === 'news' ? "อัปเดตข้อมูลข่าวจากเว็บล่าสุด" : "อัปเดตข้อมูลทิปส์ไอที")}
                </button>
                {plan.trendSnapshot.fetchedAt && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    ดึงข้อมูลล่าสุด: {new Date(plan.trendSnapshot.fetchedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <button 
                className="island-button" 
                onClick={() => generatePlanMutation.mutate()} 
                disabled={loading}
                style={{ marginLeft: 'auto', background: 'var(--color-text-primary)' }}
              >
                Generate แผนเทรนด์ 7 วัน
                <span className="island-button-icon">✨</span>
              </button>
            </div>
            </div>
          </FadeUpReveal>

          <FadeUpReveal delay={200} style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: 'span 4' }}>
            <NewsAndTipsList 
              activeTab={activeTab} 
              items={plan.trendSnapshot.items} 
              onAdd={addNewsToPlan} 
              loading={loading} 
            />

            <section className="double-bezel-outer">
              <div className="double-bezel-inner">
              <div className="sectionHeader">
                <PanelTitle
                  step="Viral Radar"
                  title="หัวข้อที่ควรดันหนัก"
                  description="เรียงจากคะแนนไวรัลและความเหมาะกับตัวตนเพจ Techtainment"
                />
              </div>
              <div className="topPostGrid" style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}>
                {topPosts.map((post) => (
                  <TopPostCard post={post} key={post.id} />
                ))}
              </div>
              </div>
            </section>
          </FadeUpReveal>

        </section>

        <FadeUpReveal delay={300} className="double-bezel-outer" style={{ marginTop: '24px' }}>
          <div className="double-bezel-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <PanelTitle
              step="ตาราง 7 วัน"
              title="แผนโพสต์รายสัปดาห์"
              description="ผลลัพธ์เป็นภาษาไทย โดยคงศัพท์ IT ที่ควรใช้เป็นภาษาอังกฤษ เช่น AI, Windows, RTX, Notebook, Office Productivity"
            />
            {plan.weeklyPosts.length > 0 && (
              <button 
                className="island-button" 
                onClick={() => {
                  import("../../utils/exportUtils").then(({ exportTrendPlanToExcel }) => {
                    exportTrendPlanToExcel(plan);
                    import("react-hot-toast").then(({ toast }) => toast.success("Export แผนเป็น Excel สำเร็จ!"));
                  });
                }}
              >
                Export เป็น Excel
                <span className="island-button-icon">📊</span>
              </button>
            )}
          </div>
          <div className="trendCalendar bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {plan.weeklyPosts.map((post) => (
              <TrendPostCard post={post} key={post.id} />
            ))}
          </div>
          </div>
        </FadeUpReveal>
      </div>
    </main>
  );
}


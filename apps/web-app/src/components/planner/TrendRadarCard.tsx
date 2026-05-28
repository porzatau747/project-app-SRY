import React from "react";
import { TrendSnapshot, TrendSnapshotItem } from "../../types/planner";
import { PanelTitle } from "./PanelTitle";

export function TrendRadarCard({ snapshot }: { snapshot: TrendSnapshot | null }) {
  if (!snapshot) return null;

  // Filter for important and highly viral news
  const topTrends = snapshot.items.filter((i: TrendSnapshotItem) => i.score >= 80).sort((a: TrendSnapshotItem,b: TrendSnapshotItem) => b.score - a.score).slice(0, 3);

  return (
    <div className="panel stepPanel" style={{ marginBottom: "24px" }}>
      <div className="sectionHeader">
        <div>
          <PanelTitle step="Trend Radar ล่าสุด" title={snapshot.headline} description="เฉพาะข่าวสำคัญและดึงดูดที่มีผลกระทบสูง" />
        </div>
      </div>
      <div className="trendCalendar">
        {topTrends.map((trend: TrendSnapshotItem, index: number) => (
          <div key={`${trend.id}-${index}`} className="trendPostCard" style={{ padding: '12px' }}>
            <div className="trendPostHeader">
              <span>{trend.category}</span>
              <div className="miniPills">
                {trend.keywords.slice(0, 3).map((kw: string) => (
                  <span key={kw}>#{kw}</span>
                ))}
              </div>
            </div>
            <h3 style={{ fontSize: '1rem', margin: '6px 0' }}>{trend.label}</h3>
            <div className="trendFooter" style={{ marginTop: '8px', paddingTop: '8px' }}>
              <span>Viral Score: {trend.score}/100</span>
              <span>อัปเดตเมื่อ: {new Date(trend.publishedAt).toLocaleString("th-TH")}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "14px", fontSize: "0.75rem", color: "#666" }}>
        <strong>อ้างอิง:</strong> {snapshot.generatedFrom}
      </div>
    </div>
  );
}

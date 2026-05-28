import React from "react";
import type { TrendContentPlan, TrendSnapshotItem } from "../../types/planner";

export function TrendRadarList({
  items,
  fetchedAt,
  generatedFrom
}: {
  items: TrendSnapshotItem[];
  fetchedAt: string;
  generatedFrom: TrendContentPlan["trendSnapshot"]["generatedFrom"];
}) {
  const topItems = items.slice(0, 10);

  return (
    <div className="insightCard trendRadarBox">
      <h3>Trend Radar ล่าสุด</h3>
      {topItems.map((item) => (
        <p key={item.id} className="trendRadarItem">
          <strong className="trendRadarLabel">{item.label}</strong>
          <span className="trendRadarMeta">
            {item.sourceRegion === "TH" ? "ไทย" : "ต่างประเทศ"} • {item.source} • {item.category} • score {item.score}
          </span>
        </p>
      ))}
    </div>
  );
}

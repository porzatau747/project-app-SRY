import React from "react";
import type { TrendSnapshotItem } from "../../types/planner";

export function NewsAndTipsList({ 
  items, 
  onAdd, 
  loading 
}: { 
  items: TrendSnapshotItem[]; 
  onAdd: (item: TrendSnapshotItem) => void;
  loading: boolean;
}) {
  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner">
      <h2 className="listHeader">
        📰 คลังข่าว IT ล่าสุด
      </h2>
      <div className="listWrapper">
        {items.map((item) => (
          <div key={item.id} className="listItemCard">
            <div className="listItemContent">
              <h3 className="listItemTitle">
                <a href={item.url} target="_blank" rel="noreferrer">{item.label}</a>
              </h3>
              <p className="listItemMeta">
                แหล่งที่มา: {item.source} {item.category ? `• หมวดหมู่: ${item.category}` : ''}
              </p>
            </div>
            <button 
              className="island-button" 
              onClick={() => onAdd(item)}
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              ✨ สร้างคอนเทนต์ด้วย AI
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

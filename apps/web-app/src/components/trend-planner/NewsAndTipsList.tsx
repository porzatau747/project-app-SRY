import React from "react";
import type { TrendSnapshotItem } from "../../types/planner";

export function NewsAndTipsList({ 
  activeTab, 
  items, 
  onAdd, 
  loading 
}: { 
  activeTab: 'news' | 'tips'; 
  items: TrendSnapshotItem[]; 
  onAdd: (item: TrendSnapshotItem) => void;
  loading: boolean;
}) {
  const filteredItems = items.filter(item => activeTab === 'news' ? item.type !== 'tip' : item.type === 'tip');

  return (
    <div className="double-bezel-outer">
      <div className="double-bezel-inner">
      <h2 className="listHeader">
        {activeTab === 'news' ? '📰 คลังข่าว IT ล่าสุด' : '💡 คลังทิปส์ไอที ล่าสุด'}
      </h2>
      <div className="listWrapper">
        {filteredItems.map((item) => (
          <div key={item.id} className="listItemCard">
            <div className="listItemContent">
              <h3 className="listItemTitle">
                <a href={item.url} target="_blank" rel="noreferrer">{item.label}</a>
              </h3>
              <p className="listItemMeta">
                แหล่งที่มา: {item.source} {activeTab === 'news' && item.category ? `• หมวดหมู่: ${item.category}` : ''}
              </p>
            </div>
            <button 
              className={activeTab === 'tips' ? "island-button tipsAddBtn" : "island-button"} 
              onClick={() => onAdd(activeTab === 'tips' ? { ...item, category: "Tips & Tricks" as any } : item)}
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '0.8rem' }}
            >
              {activeTab === 'news' ? '+ เพิ่มลงปฏิทิน' : '+ เพิ่มทิปส์'}
            </button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

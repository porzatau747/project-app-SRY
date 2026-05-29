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
    <div className="panel listPanel">
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
              className={activeTab === 'tips' ? "secondaryButton tipsAddBtn" : "secondaryButton"} 
              onClick={() => onAdd(activeTab === 'tips' ? { ...item, category: "Tips & Tricks" } : item)}
              disabled={loading}
            >
              {activeTab === 'news' ? '+ เพิ่มลงปฏิทิน' : '+ เพิ่มทิปส์'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

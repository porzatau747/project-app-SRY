import React from "react";

export function TabSwitcher({ activeTab, setActiveTab }: { activeTab: 'news' | 'tips', setActiveTab: (tab: 'news' | 'tips') => void }) {
  return (
    <div className="tabSwitcherGroup">
      <button 
        className={activeTab === 'news' ? 'primaryButton tabBtn' : 'secondaryButton tabBtn'} 
        onClick={() => setActiveTab('news')}
      >
        ข่าว IT
      </button>
      <button 
        className={activeTab === 'tips' ? 'primaryButton tabBtn' : 'secondaryButton tabBtn'} 
        onClick={() => setActiveTab('tips')}
      >
        ทิปส์ไอที
      </button>
    </div>
  );
}

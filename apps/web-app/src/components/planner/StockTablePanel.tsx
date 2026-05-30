import React, { useState } from "react";
import { InventoryItem } from "../../types/planner";
import { PanelTitle } from "./PanelTitle";
import { calculateAgingDiscount } from "../../utils/plannerUtils";
import { getMacroCategory, MACRO_CATEGORIES, MacroCategory } from "../../utils/categoryUtils";

const moneyFormatter = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' });

export function StockTablePanel({ 
  inventory, 
  onSelectProduct, 
  onSearchPrice, 
  loading,
  renderCustomAction
}: { 
  inventory: InventoryItem[]; 
  onSelectProduct?: (code: string) => void; 
  onSearchPrice: (code: string) => void; 
  loading: boolean;
  renderCustomAction?: (item: InventoryItem) => React.ReactNode;
}) {
  const [selectedCats, setSelectedCats] = useState<Set<MacroCategory>>(new Set());

  if (!inventory || !inventory.length) return null;

  // Enhance inventory with macroCategory
  const enhancedInventory = inventory.map(item => ({
    ...item,
    macroCategory: getMacroCategory(item.itemType)
  }));

  const activeCategories = MACRO_CATEGORIES.filter(cat => enhancedInventory.some(i => i.macroCategory === cat));

  const displayedInventory = selectedCats.size > 0 
    ? enhancedInventory.filter(i => selectedCats.has(i.macroCategory)) 
    : enhancedInventory;

  const toggleCat = (cat: MacroCategory) => {
    const next = new Set(selectedCats);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelectedCats(next);
  };

  return (
    <div className="panel stepPanel" style={{ marginTop: '24px' }}>
      <PanelTitle step="ข้อมูลทั้งหมด" title="รายการสินค้าในสต็อก" description="ดูรหัส หมวดหมู่ ราคาทุน และอายุสต็อกของสินค้าทั้งหมด" />
      
      <div style={{ margin: '14px 0', padding: '12px', background: '#1c1917', borderRadius: '8px', border: '1px solid #292524' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#d6d3d1' }}><strong>ตัวกรองหมวดหมู่:</strong></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {activeCategories.map(cat => (
            <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', cursor: 'pointer', color: '#a8a29e', background: selectedCats.has(cat) ? '#44403c' : 'transparent', padding: '4px 8px', borderRadius: '4px', border: '1px solid #44403c' }}>
              <input 
                type="checkbox" 
                checked={selectedCats.has(cat)}
                onChange={() => toggleCat(cat)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #292524', borderRadius: '8px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ background: '#1c1917', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524' }}>รหัสสินค้า</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524' }}>ชื่อสินค้า</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524' }}>หมวดหมู่</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524', textAlign: 'right' }}>ราคาทุน</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524', textAlign: 'right' }}>ราคาขาย</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524', textAlign: 'right' }}>Aging (วัน)</th>
              <th style={{ padding: '10px', borderBottom: '1px solid #292524', width: '130px' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayedInventory.map((item, index) => (
              <tr key={`${item.code}-${index}`} style={{ borderBottom: '1px solid #292524' }}>
                <td style={{ padding: '10px', color: '#a8a29e' }}>{item.code}</td>
                <td style={{ padding: '10px' }}>{item.product}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 'bold', color: '#d6d3d1' }}>{item.macroCategory}</div>
                  <div style={{ fontSize: '0.75rem', color: '#78716c' }}>{item.itemType}</div>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#fca5a5' }}>{moneyFormatter.format(item.cost)}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  {(() => {
                    const discountInfo = calculateAgingDiscount(item.sellPrice, item.agingDays);
                    if (!discountInfo) {
                      return <span style={{ color: '#fca5a5' }}>⚠️ ไม่มีราคา</span>;
                    }
                    if (discountInfo.discount > 0) {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span style={{ color: '#78716c', textDecoration: 'line-through', fontSize: '0.8em' }}>
                            {moneyFormatter.format(discountInfo.originalPrice)}
                          </span>
                          <span style={{ color: '#86efac', fontWeight: 'bold' }}>
                            {moneyFormatter.format(discountInfo.specialPrice)}
                          </span>
                          <span style={{ color: '#fbbf24', fontSize: '0.7em', padding: '1px 4px', background: '#451a03', borderRadius: '4px' }}>
                            -{discountInfo.discount * 100}%
                          </span>
                        </div>
                      );
                    }
                    return <span style={{ color: '#a3e635' }}>{moneyFormatter.format(discountInfo.specialPrice)}</span>;
                  })()}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', color: item.agingDays >= 180 ? '#fca5a5' : '#a8a29e' }}>
                  {item.agingDays !== undefined && item.agingDays !== null ? item.agingDays : "-"}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                  {!item.sellPrice && (
                    <button className="secondaryButton compactButton" onClick={() => onSearchPrice(item.code)} disabled={loading} style={{ padding: '2px 8px', fontSize: '0.8em', minHeight: '28px', minWidth: 'auto', borderColor: '#fbbf24', color: '#fbbf24' }}>
                      ค้นหาราคา
                    </button>
                  )}
                  {renderCustomAction ? (
                    renderCustomAction(item)
                  ) : onSelectProduct ? (
                    <button className="secondaryButton compactButton" onClick={() => onSelectProduct(item.code)} disabled={loading} style={{ padding: '2px 8px', fontSize: '0.8em', minHeight: '28px', minWidth: 'auto' }}>
                      ✨ สร้างคอนเทนต์
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

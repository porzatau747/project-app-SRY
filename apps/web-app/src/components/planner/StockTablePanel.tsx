import React, { useState } from "react";
import { InventoryItem } from "../../types/planner";
import { PanelTitle } from "./PanelTitle";
import { calculateAgingDiscount } from "../../utils/plannerUtils";
import { getMacroCategory, MACRO_CATEGORIES, MacroCategory } from "../../utils/categoryUtils";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

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
  const [agingSort, setAgingSort] = useState<'none' | 'desc' | 'asc'>('none');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());

  if (!inventory || !inventory.length) return null;

  // Enhance inventory with macroCategory
  const enhancedInventory = inventory.map(item => ({
    ...item,
    macroCategory: getMacroCategory(item.itemType)
  }));

  const activeCategories = MACRO_CATEGORIES.filter(cat => enhancedInventory.some(i => i.macroCategory === cat));

  let displayedInventory = selectedCats.size > 0 
    ? enhancedInventory.filter(i => selectedCats.has(i.macroCategory)) 
    : enhancedInventory;

  if (agingSort === 'desc') {
    displayedInventory = [...displayedInventory].sort((a, b) => (b.agingDays || 0) - (a.agingDays || 0));
  } else if (agingSort === 'asc') {
    displayedInventory = [...displayedInventory].sort((a, b) => (a.agingDays || 0) - (b.agingDays || 0));
  }

  const toggleCat = (cat: MacroCategory) => {
    const next = new Set(selectedCats);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setSelectedCats(next);
    // Clear selection of codes that are no longer visible
    setSelectedCodes(new Set());
  };

  const toggleAgingSort = () => {
    if (agingSort === 'none') setAgingSort('desc');
    else if (agingSort === 'desc') setAgingSort('asc');
    else setAgingSort('none');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCodes = displayedInventory.map(item => item.code);
      setSelectedCodes(new Set(allCodes));
    } else {
      setSelectedCodes(new Set());
    }
  };

  const handleSelectRow = (code: string, checked: boolean) => {
    const next = new Set(selectedCodes);
    if (checked) {
      next.add(code);
    } else {
      next.delete(code);
    }
    setSelectedCodes(next);
  };

  const handleExportExcel = () => {
    const itemsToExport = selectedCodes.size > 0 
      ? displayedInventory.filter(item => selectedCodes.has(item.code))
      : displayedInventory;

    if (itemsToExport.length === 0) {
      toast.error("ไม่มีข้อมูลสินค้าที่จะส่งออก");
      return;
    }

    const data = itemsToExport.map(item => {
      const discountInfo = calculateAgingDiscount(item.sellPrice, item.agingDays);
      return {
        "รหัสสินค้า": item.code,
        "S/N": item.serial || "-",
        "ชื่อสินค้า": item.product,
        "หมวดหมู่": item.macroCategory,
        "ประเภทสินค้า": item.itemType,
        "ราคาทุน (บาท)": item.cost,
        "ราคาขายปกติ (บาท)": item.sellPrice || "-",
        "ราคาขายพิเศษ (บาท)": discountInfo ? discountInfo.specialPrice : "-",
        "ส่วนลด (%)": discountInfo && discountInfo.discount > 0 ? `${discountInfo.discount * 100}%` : "0%",
        "อายุสินค้า (วัน)": item.agingDays !== undefined && item.agingDays !== null ? item.agingDays : "-"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "รายการสินค้า");
    
    // Auto-fit columns
    const maxLens = Object.keys(data[0] || {}).map(key => {
      let maxLen = key.length;
      data.forEach(row => {
        const val = (row as any)[key];
        if (val !== null && val !== undefined) {
          maxLen = Math.max(maxLen, val.toString().length);
        }
      });
      return { wch: maxLen + 4 };
    });
    worksheet["!cols"] = maxLens;

    XLSX.writeFile(workbook, `stock-plan-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success(`ส่งออกสินค้าเรียบร้อยแล้ว (${itemsToExport.length} รายการ)`);
  };

  return (
    <div className="panel stepPanel" style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <PanelTitle step="ข้อมูลทั้งหมด" title="รายการสินค้าในสต็อก" description="ดูรหัส หมวดหมู่ ราคาทุน และอายุสต็อกของสินค้าทั้งหมด" />
        <button 
          className="primaryButton" 
          onClick={handleExportExcel}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '38px', width: 'auto', padding: '0 16px', fontSize: '0.85rem' }}
        >
          📥 ส่งออก Excel ({selectedCodes.size > 0 ? `${selectedCodes.size} รายการ` : 'ทั้งหมดในตาราง'})
        </button>
      </div>
      
      <div style={{ margin: '14px 0', padding: '12px', background: 'rgba(2,4,10,0.8)', borderRadius: '8px', border: '1px solid var(--color-glass-border)' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#fafaf9' }}><strong>ตัวกรองหมวดหมู่:</strong></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {activeCategories.map(cat => {
            const isSelected = selectedCats.has(cat);
            return (
              <label 
                key={cat} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer', 
                  color: isSelected ? 'var(--color-neon-cyan)' : 'var(--color-text-secondary)', 
                  background: isSelected ? 'rgba(34, 211, 238, 0.12)' : 'transparent', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  border: '1px solid',
                  borderColor: isSelected ? 'rgba(34, 211, 238, 0.45)' : 'var(--color-glass-border)',
                  boxShadow: isSelected ? '0 0 10px rgba(34, 211, 238, 0.15)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleCat(cat)}
                  style={{ cursor: 'pointer', margin: 0 }}
                />
                {cat}
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--color-glass-border)', borderRadius: '8px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead style={{ background: 'rgba(10, 15, 30, 0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', width: '40px' }}>
                <input 
                  type="checkbox"
                  checked={displayedInventory.length > 0 && selectedCodes.size === displayedInventory.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                  title="เลือกทั้งหมด"
                />
              </th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9' }}>รหัสสินค้า</th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9' }}>ชื่อสินค้า</th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9' }}>หมวดหมู่</th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9', textAlign: 'right' }}>ราคาทุน</th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9', textAlign: 'right' }}>ราคาขาย</th>
              <th 
                style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', color: '#fafaf9', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }} 
                onClick={toggleAgingSort}
                title="คลิกเพื่อเรียงลำดับ Aging"
              >
                Aging (วัน) {agingSort === 'desc' ? '▼' : agingSort === 'asc' ? '▲' : '↕️'}
              </th>
              <th style={{ padding: '10px', borderBottom: '1px solid var(--color-glass-border)', width: '130px' }}></th>
            </tr>
          </thead>
          <tbody>
            {displayedInventory.map((item, index) => {
              const isRowSelected = selectedCodes.has(item.code);
              return (
                <tr key={`${item.code}-${index}`} style={{ borderBottom: '1px solid var(--color-glass-border)', transition: 'background 0.2s ease', background: isRowSelected ? 'rgba(34, 211, 238, 0.08)' : 'transparent' }} className="hover:bg-slate-900/20">
                  <td style={{ padding: '10px', width: '40px' }}>
                    <input 
                      type="checkbox"
                      checked={isRowSelected}
                      onChange={(e) => handleSelectRow(item.code, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px', color: 'var(--color-text-secondary)' }}>
                    <div>{item.code}</div>
                    {item.serial && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        SN: <span style={{ fontFamily: 'monospace' }}>{item.serial}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px', color: '#fafaf9' }}>{item.product}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#fafaf9' }}>{item.macroCategory}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.itemType}</div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#fda4af' }}>{moneyFormatter.format(item.cost)}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {(() => {
                      const discountInfo = calculateAgingDiscount(item.sellPrice, item.agingDays);
                      if (!discountInfo) {
                        return <span style={{ color: 'var(--color-clearance-red)', fontWeight: 'bold' }}>⚠️ ไม่มีราคา</span>;
                      }
                      if (discountInfo.discount > 0) {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <span style={{ color: 'var(--color-text-secondary)', textDecoration: 'line-through', fontSize: '0.8em' }}>
                              {moneyFormatter.format(discountInfo.originalPrice)}
                            </span>
                            <span style={{ color: 'var(--color-neon-cyan)', fontWeight: 'bold', textShadow: '0 0 6px rgba(34,211,238,0.2)' }}>
                              {moneyFormatter.format(discountInfo.specialPrice)}
                            </span>
                            <span style={{ color: '#02040a', fontWeight: 800, fontSize: '0.7em', padding: '2px 6px', background: 'var(--color-neon-yellow)', borderRadius: '4px', boxShadow: '0 0 5px rgba(250,204,21,0.3)' }}>
                              -{discountInfo.discount * 100}%
                            </span>
                          </div>
                        );
                      }
                      return <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{moneyFormatter.format(discountInfo.specialPrice)}</span>;
                    })()}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {item.agingDays !== undefined && item.agingDays !== null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ color: item.agingDays >= 91 ? 'var(--color-clearance-red)' : 'var(--color-text-secondary)', fontWeight: item.agingDays >= 91 ? 'bold' : 'normal' }}>
                          {item.agingDays} วัน
                        </span>
                        {item.agingDays >= 91 && (
                          <span 
                            style={{ 
                              fontSize: '0.65rem', 
                              background: 'rgba(239,68,68,0.15)', 
                              color: 'var(--color-clearance-red)', 
                              border: '1px solid var(--color-clearance-red)', 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              textShadow: '0 0 5px var(--color-clearance-red)',
                              boxShadow: '0 0 8px rgba(239,68,68,0.3)',
                              fontWeight: 'bold'
                            }}
                          >
                            🚨 CLEARANCE
                          </span>
                        )}
                      </div>
                    ) : "-"}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {!item.sellPrice && (
                      <button className="secondaryButton compactButton" onClick={() => onSearchPrice(item.code)} disabled={loading} style={{ padding: '2px 8px', fontSize: '0.8em', minHeight: '28px', minWidth: 'auto', borderColor: 'var(--color-neon-yellow)', color: 'var(--color-neon-yellow)' }}>
                        ค้นหาราคา
                      </button>
                    )}
                    {renderCustomAction ? (
                      renderCustomAction(item)
                    ) : onSelectProduct ? (
                      <button className="secondaryButton compactButton" onClick={() => onSelectProduct(item.code)} disabled={loading} style={{ padding: '2px 8px', fontSize: '0.8em', minHeight: '28px', minWidth: 'auto', borderColor: 'rgba(34, 211, 238, 0.45)', color: '#fafaf9', background: 'rgba(34, 211, 238, 0.05)' }}>
                        ✨ สร้างคอนเทนต์
                      </button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

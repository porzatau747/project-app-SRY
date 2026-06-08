import React, { useState } from "react";
import { InventoryItem } from "../../types/planner";
import { getMacroCategory } from "../../utils/categoryUtils";

const moneyFormatter = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("th-TH", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function StockDashboard({ inventory }: { inventory: InventoryItem[] }) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  if (!inventory || !inventory.length) return null;

  // 1. คำนวณข้อมูลการเงิน
  let totalCost = 0;
  let totalRevenue = 0;
  let totalMargin = 0;
  let revenueForMargin = 0;

  for (const item of inventory) {
    const itemCost = item.cost * item.qty;
    totalCost += itemCost;
    if (item.sellPrice !== null) {
      const itemRev = item.sellPrice * item.qty;
      totalRevenue += itemRev;
      revenueForMargin += itemRev;
      totalMargin += (item.sellPrice - item.cost) * item.qty;
    }
  }
  const avgMarginPercent = revenueForMargin > 0 ? totalMargin / revenueForMargin : 0;

  // 2. คำนวณ Aging
  let healthyQty = 0; // 0-30 days
  let warningQty = 0; // 31-90 days
  let criticalQty = 0; // 91+ days
  let totalQty = 0;

  for (const item of inventory) {
    totalQty += item.qty;
    const days = item.agingDays ?? 0;
    if (days <= 30) healthyQty += item.qty;
    else if (days <= 90) warningQty += item.qty;
    else criticalQty += item.qty;
  }

  // 3. จัดกลุ่มหมวดหมู่สินค้าแบบไดนามิก (Dynamic Grouping - Max 6 segments)
  const categoryTotals: Record<string, { qty: number; value: number }> = {};
  for (const item of inventory) {
    const cat = getMacroCategory(item.itemType);
    if (!categoryTotals[cat]) categoryTotals[cat] = { qty: 0, value: 0 };
    categoryTotals[cat].qty += item.qty;
    categoryTotals[cat].value += item.stockValue;
  }

  const allCategories = Object.keys(categoryTotals);
  const targetCategory = "เมาส์และคีย์บอร์ด (ทั่วไป)";
  const hasTarget = allCategories.includes(targetCategory);

  // ดึงหมวดหมู่อื่นๆ ที่ไม่ใช่เป้าหมาย
  const otherCats = allCategories.filter(cat => cat !== targetCategory && cat !== "อื่นๆ");
  otherCats.sort((a, b) => categoryTotals[b].value - categoryTotals[a].value);

  // เลือก Top 4 หมวดหมู่อื่น
  const top4Others = otherCats.slice(0, 4);
  const restCats = otherCats.slice(4);

  // สร้างอาร์เรย์สรุปกลุ่มสินค้า 6 กลุ่ม
  interface Segment {
    name: string;
    qty: number;
    value: number;
    color: string;
  }

  const colors = ["#22d3ee", "#22c55e", "#a855f7", "#f97316"]; // Top 4 neon colors
  const segments: Segment[] = [];

  // เพิ่ม Top 4 ลงเซกเมนต์
  top4Others.forEach((cat, index) => {
    segments.push({
      name: cat,
      qty: categoryTotals[cat].qty,
      value: categoryTotals[cat].value,
      color: colors[index]
    });
  });

  // เพิ่ม "เมาส์และคีย์บอร์ด (ทั่วไป)"
  if (hasTarget && categoryTotals[targetCategory].qty > 0) {
    segments.push({
      name: targetCategory,
      qty: categoryTotals[targetCategory].qty,
      value: categoryTotals[targetCategory].value,
      color: "#ec4899" // นีออนชมพูสะท้อนแสงสว่างเด่น
    });
  }

  // รวมหมวดหมู่ที่เหลือทั้งหมดเป็น "อื่นๆ"
  let othersQty = 0;
  let othersValue = 0;
  restCats.forEach(cat => {
    othersQty += categoryTotals[cat].qty;
    othersValue += categoryTotals[cat].value;
  });
  if (categoryTotals["อื่นๆ"]) {
    othersQty += categoryTotals["อื่นๆ"].qty;
    othersValue += categoryTotals["อื่นๆ"].value;
  }

  if (othersQty > 0) {
    segments.push({
      name: "อื่นๆ",
      qty: othersQty,
      value: othersValue,
      color: "#475569" // Slate-600
    });
  }

  const totalSegmentValue = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="panel stepPanel" style={{ marginBottom: "24px" }}>
      {/* 1. Header & Financial metrics */}
      <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fafaf9", marginBottom: "16px", textShadow: "0 0 10px rgba(250,204,21,0.15)" }}>แดชบอร์ดสรุปข้อมูลสต็อกสินค้า</h2>
      
      <div className="summaryTiles" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        <div className="metricTile" style={{ borderLeft: "4px solid #94a3b8" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>ทุนสะสม (Total Cost)</span>
          <strong style={{ fontSize: "1.2rem", color: "#fafaf9" }}>{moneyFormatter.format(totalCost)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid var(--color-neon-cyan)", boxShadow: "0 0 10px rgba(34,211,238,0.05)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>รายได้คาดการณ์ (Projected Rev)</span>
          <strong style={{ fontSize: "1.2rem", color: "var(--color-neon-cyan)" }}>{moneyFormatter.format(totalRevenue)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid var(--color-neon-yellow)", boxShadow: "0 0 10px rgba(250,204,21,0.05)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>กำไรคาดการณ์ (Projected Margin)</span>
          <strong style={{ fontSize: "1.2rem", color: "var(--color-neon-yellow)" }}>{moneyFormatter.format(totalMargin)}</strong>
        </div>
        <div className="metricTile" style={{ borderLeft: "4px solid #a855f7" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>อัตรากำไรเฉลี่ย (Avg Margin %)</span>
          <strong style={{ fontSize: "1.2rem", color: "#a855f7" }}>{percentFormatter.format(avgMarginPercent)}</strong>
        </div>
      </div>

      {/* 2. Aging Distribution */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>การกระจายอายุสินค้า (Aging Distribution)</span>
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>ทั้งหมด {totalQty} ชิ้น</span>
        </div>
        <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", background: "rgba(2,4,10,0.8)", marginBottom: "8px", border: "1px solid var(--color-glass-border)" }}>
          {healthyQty > 0 && <div style={{ width: `${(healthyQty / totalQty) * 100}%`, background: "#22c55e" }} title="0-30 วัน" />}
          {warningQty > 0 && <div style={{ width: `${(warningQty / totalQty) * 100}%`, background: "var(--color-neon-yellow)" }} title="31-90 วัน" />}
          {criticalQty > 0 && <div style={{ width: `${(criticalQty / totalQty) * 100}%`, background: "var(--color-clearance-red)" }} title="91+ วัน" />}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ color: "var(--color-text-secondary)" }}>0-30 วัน (ปกติ): {healthyQty} ชิ้น ({percentFormatter.format(healthyQty / totalQty)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-neon-yellow)" }} />
            <span style={{ color: "var(--color-text-secondary)" }}>31-90 วัน (เฝ้าระวัง): {warningQty} ชิ้น ({percentFormatter.format(warningQty / totalQty)})</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--color-clearance-red)" }} />
            <span style={{ color: "#fca5a5", fontWeight: "bold" }}>91+ วัน (สินค้า Clearance): {criticalQty} ชิ้น ({percentFormatter.format(criticalQty / totalQty)})</span>
          </div>
        </div>
      </div>

      {/* 3. Category Allocation Bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>สัดส่วนประเภทสินค้า (Category Allocation)</span>
        </div>
        {/* Dynamic Category Bar */}
        <div style={{ display: "flex", height: "20px", borderRadius: "6px", overflow: "hidden", background: "rgba(2,4,10,0.8)", marginBottom: "12px", border: "1px solid var(--color-glass-border)" }}>
          {segments.map(seg => {
            const isHovered = hoveredCategory === seg.name;
            const hasHovered = hoveredCategory !== null;
            const opacity = hasHovered ? (isHovered ? 1 : 0.3) : 1;
            const shadow = isHovered ? "0 0 10px rgba(255,255,255,0.4) inset" : "none";
            const percent = (seg.value / totalSegmentValue) * 100;

            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredCategory(seg.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  width: `${percent}%`,
                  background: seg.color,
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity,
                  boxShadow: shadow,
                  cursor: "pointer"
                }}
                title={`${seg.name}: ${moneyFormatter.format(seg.value)}`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", transition: "opacity 0.2s ease" }}>
          {segments.map(seg => {
            const isHovered = hoveredCategory === seg.name;
            const hasHovered = hoveredCategory !== null;
            const opacity = hasHovered ? (isHovered ? 1 : 0.3) : 1;

            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredCategory(seg.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  opacity,
                  transition: "opacity 0.2s ease",
                  transform: isHovered ? "scale(1.03)" : "scale(1)",
                }}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: seg.color }} />
                <span style={{ color: "#d6d3d1", fontWeight: isHovered ? "bold" : "normal" }}>
                  {seg.name}: {seg.qty} ชิ้น ({moneyFormatter.format(seg.value)})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
